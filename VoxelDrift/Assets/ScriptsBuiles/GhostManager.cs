using System.Collections.Generic;
using UnityEngine;

public class GhostManager : MonoBehaviour
{
    public static GhostManager Instancia { get; private set; }

    [Header("Configuración de Grabación")]
    [SerializeField] private float intervaloGrabacion = 0.08f; 

    [Header("Configuración de Fantasma")]
    [SerializeField] private Shader shaderTransparenteFantasma; // Casilla para asignar tu Shader transparente en el Inspector
    [SerializeField] [Range(0f, 1f)] private float opacidadFantasma = 0.3f; // Opacidad por defecto en 0.3

    private Transform jugadorTransform;
    private List<GhostFrame> framesGrabados = new List<GhostFrame>();
    private float temporizadorGrabacion = 0f;
    private bool grabando = false;

    // FANTASMA DEL AMIGO
    private LevelGhostData ghostAmigo;
    private GameObject ghostCarObj;
    private int frameIndex = 0;
    private bool reproducirFantasma = false;

    void Awake()
    {
        Instancia = this;
    }

    void Start()
    {
        BuscarJugadorEInicializar();
    }

    private void BuscarJugadorEInicializar()
    {
        GameObject jugadorObj = GameObject.FindWithTag("Player");
        if (jugadorObj != null)
        {
            jugadorTransform = jugadorObj.transform;
            grabando = true;

            if (WebBridgeManager.Instancia != null && WebBridgeManager.Instancia.ghostDataActual != null)
            {
                ghostAmigo = WebBridgeManager.Instancia.ghostDataActual;
                CrearFantasmaEnEscena(ghostAmigo);
            }
        }
    }

    void Update()
    {
        if (jugadorTransform == null)
        {
            BuscarJugadorEInicializar();
            return;
        }

        if (grabando)
        {
            temporizadorGrabacion += Time.deltaTime;
            if (temporizadorGrabacion >= intervaloGrabacion)
            {
                temporizadorGrabacion = 0f;
                LevelManager lm = FindFirstObjectByType<LevelManager>();
                float tActual = lm != null ? lm.tiempoActual : Time.time;

                framesGrabados.Add(new GhostFrame
                {
                    t = tActual,
                    p = jugadorTransform.position,
                    r = jugadorTransform.eulerAngles
                });
            }
        }

        if (reproducirFantasma && ghostCarObj != null && ghostAmigo != null && ghostAmigo.frames != null && ghostAmigo.frames.Count > 0)
        {
            LevelManager lm = FindFirstObjectByType<LevelManager>();
            float tActual = lm != null ? lm.tiempoActual : Time.time;

            ActualizarPosicionFantasma(tActual);
        }
    }

    private void ActualizarPosicionFantasma(float tiempoEscena)
    {
        List<GhostFrame> frames = ghostAmigo.frames;
        if (frames == null || frames.Count == 0) return;

        while (frameIndex < frames.Count - 1 && frames[frameIndex + 1].t <= tiempoEscena)
        {
            frameIndex++;
        }

        if (frameIndex >= frames.Count - 1)
        {
            GhostFrame ultimo = frames[frames.Count - 1];
            ghostCarObj.transform.position = ultimo.p;
            ghostCarObj.transform.rotation = Quaternion.Euler(ultimo.r);
            return;
        }

        GhostFrame f1 = frames[frameIndex];
        GhostFrame f2 = frames[frameIndex + 1];

        float factor = Mathf.Clamp01((tiempoEscena - f1.t) / (f2.t - f1.t));
        ghostCarObj.transform.position = Vector3.Lerp(f1.p, f2.p, factor);
        ghostCarObj.transform.rotation = Quaternion.Slerp(Quaternion.Euler(f1.r), Quaternion.Euler(f2.r), factor);
    }

    private void CrearFantasmaEnEscena(LevelGhostData data)
    {
        if (jugadorTransform == null || data == null || data.frames == null || data.frames.Count == 0) return;

        // 1. Respaldar el color del jugador
        int colorOriginalJugador = PlayerPrefs.GetInt("CarColorIndex", 0);

        ghostCarObj = Instantiate(jugadorTransform.gameObject, data.frames[0].p, Quaternion.Euler(data.frames[0].r));
        ghostCarObj.name = "Fantasma_Amigo";
        ghostCarObj.tag = "Untagged"; 

        // 2. Destruir Audios y Listeners del fantasma para evitar loops de sonido
        AudioSource[] audios = ghostCarObj.GetComponentsInChildren<AudioSource>();
        foreach (AudioSource a in audios)
        {
            a.Stop();
            Destroy(a);
        }

        AudioListener[] listeners = ghostCarObj.GetComponentsInChildren<AudioListener>();
        foreach (AudioListener l in listeners)
        {
            Destroy(l);
        }

        // 3. Destruir Colliders
        Collider[] cols = ghostCarObj.GetComponentsInChildren<Collider>();
        foreach (Collider col in cols)
        {
            col.enabled = false;
            Destroy(col);
        }

        // 4. Destruir Rigidbodies
        Rigidbody[] rbs = ghostCarObj.GetComponentsInChildren<Rigidbody>();
        foreach (Rigidbody rb in rbs)
        {
            rb.isKinematic = true;
            Destroy(rb);
        }

        // 5. Destruir MonoBehaviours excepto el CarColorController
        MonoBehaviour[] scripts = ghostCarObj.GetComponentsInChildren<MonoBehaviour>();
        foreach (MonoBehaviour script in scripts)
        {
            if (script != null && !(script is CarColorController))
            {
                script.enabled = false;
                Destroy(script);
            }
        }

        // 6. Aplicar el color del amigo al fantasma
        CarColorController colorCtrl = ghostCarObj.GetComponent<CarColorController>();
        if (colorCtrl != null)
        {
            colorCtrl.AplicarMaterial(data.colorCarro);
            Destroy(colorCtrl);
        }

        // 7. Restaurar el color original del jugador en PlayerPrefs
        PlayerPrefs.SetInt("CarColorIndex", colorOriginalJugador);
        PlayerPrefs.Save();

        // 8. Aplicar Shader Transparente a los renderers del fantasma
        AplicarTransparenciaAFantasma(ghostCarObj);

        reproducirFantasma = true;
    }

    private void AplicarTransparenciaAFantasma(GameObject fantasma)
    {
        Shader shaderTarget = shaderTransparenteFantasma;

        Renderer[] renderers = fantasma.GetComponentsInChildren<Renderer>();
        foreach (Renderer rend in renderers)
        {
            Material[] matsOriginales = rend.materials;
            Material[] nuevosMats = new Material[matsOriginales.Length];

            for (int i = 0; i < matsOriginales.Length; i++)
            {
                Material matOld = matsOriginales[i];
                if (matOld == null) continue;

                // 1. Clonar el material original para mantener intactos sus colores y propiedades
                Material matNuevo = new Material(matOld);

                // 2. Si asignaste un shader transparente en el Inspector, cambiar únicamente la referencia del shader
                if (shaderTarget != null)
                {
                    matNuevo.shader = shaderTarget;
                }

                // 3. Configurar opciones de transparencia URP
                if (matNuevo.HasProperty("_Surface")) matNuevo.SetFloat("_Surface", 1.0f); // 1 = Transparent
                if (matNuevo.HasProperty("_Blend")) matNuevo.SetFloat("_Blend", 0.0f);
                matNuevo.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                matNuevo.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                matNuevo.SetInt("_ZWrite", 0);
                matNuevo.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                matNuevo.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Transparent;

                // 4. Asignar la propiedad específica de tu Shader Graph (_Alpha_Multiplier)
                if (matNuevo.HasProperty("_Alpha_Multiplier"))
                {
                    matNuevo.SetFloat("_Alpha_Multiplier", opacidadFantasma);
                }

                // 5. Asignar Alfa en las propiedades de color base si existen
                if (matNuevo.HasProperty("_BaseColor"))
                {
                    Color c = matNuevo.GetColor("_BaseColor");
                    c.a = opacidadFantasma;
                    matNuevo.SetColor("_BaseColor", c);
                }
                else if (matNuevo.HasProperty("_Color"))
                {
                    Color c = matNuevo.color;
                    c.a = opacidadFantasma;
                    matNuevo.color = c;
                }

                nuevosMats[i] = matNuevo;
            }

            rend.materials = nuevosMats;
        }
    }

    public LevelGhostData ObtenerGrabacionActual(string idNivel, float tiempoFinal)
    {
        int colorActual = PlayerPrefs.GetInt("CarColorIndex", 0);
        return new LevelGhostData
        {
            idNivel = idNivel,
            mejorTiempo = tiempoFinal,
            colorCarro = colorActual,
            frames = new List<GhostFrame>(framesGrabados)
        };
    }
}