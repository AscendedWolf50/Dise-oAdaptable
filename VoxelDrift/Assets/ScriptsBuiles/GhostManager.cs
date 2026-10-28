using System.Collections.Generic;
using UnityEngine;

public class GhostManager : MonoBehaviour
{
    public static GhostManager Instancia { get; private set; }

    [Header("Configuración de Grabación")]
    [SerializeField] private float intervaloGrabacion = 0.08f; 

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

        
        ghostCarObj = Instantiate(jugadorTransform.gameObject, data.frames[0].p, Quaternion.Euler(data.frames[0].r));
        ghostCarObj.name = "Fantasma_Amigo";

        
        Collider[] cols = ghostCarObj.GetComponentsInChildren<Collider>();
        foreach (Collider col in cols)
        {
            col.enabled = false;
            Destroy(col);
        }

        
        Rigidbody[] rbs = ghostCarObj.GetComponentsInChildren<Rigidbody>();
        foreach (Rigidbody rb in rbs)
        {
            rb.isKinematic = true;
            Destroy(rb);
        }

        
        MonoBehaviour[] scripts = ghostCarObj.GetComponentsInChildren<MonoBehaviour>();
        foreach (MonoBehaviour script in scripts)
        {
            if (script != null && !(script is CarColorController))
            {
                script.enabled = false;
                Destroy(script);
            }
        }

        
        Renderer[] renderers = ghostCarObj.GetComponentsInChildren<Renderer>();
        foreach (Renderer rend in renderers)
        {
            foreach (Material mat in rend.materials)
            {
                HacerMaterialTransparente(mat, 0.45f);
            }
        }

        
        CarColorController colorCtrl = ghostCarObj.GetComponent<CarColorController>();
        if (colorCtrl != null)
        {
            colorCtrl.AplicarMaterial(data.colorCarro);
        }

        reproducirFantasma = true;
    }

    private void HacerMaterialTransparente(Material mat, float alpha)
    {
        
        if (mat.HasProperty("_Color"))
        {
            Color c = mat.color;
            c.a = alpha;
            mat.color = c;
        }
        if (mat.HasProperty("_BaseColor"))
        {
            Color c = mat.GetColor("_BaseColor");
            c.a = alpha;
            mat.SetColor("_BaseColor", c);
        }

        
        if (mat.HasProperty("_Surface"))
        {
            mat.SetFloat("_Surface", 1.0f); 
        }

      
        mat.SetFloat("_Mode", 3);
        mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
        mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
        mat.SetInt("_ZWrite", 0);
        mat.DisableKeyword("_ALPHATEST_ON");
        mat.EnableKeyword("_ALPHABLEND_ON");
        mat.DisableKeyword("_ALPHAPREMULTIPLY_ON");
        mat.renderQueue = (int)UnityEngine.Rendering.RenderQueue.Transparent;
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