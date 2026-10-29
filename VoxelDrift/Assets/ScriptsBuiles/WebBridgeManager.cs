using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Runtime.InteropServices;

public class WebBridgeManager : MonoBehaviour
{
    public static WebBridgeManager Instancia { get; private set; }
    
    public LevelGhostData ghostDataActual { get; private set; }

    void Awake()
    {
        if (Instancia == null)
        {
            Instancia = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void OnEnable()
    {
        SceneManager.sceneLoaded += AlCargarEscena;
    }

    void OnDisable()
    {
        SceneManager.sceneLoaded -= AlCargarEscena;
    }

    
    private void AlCargarEscena(Scene escena, LoadSceneMode modo)
    {
        
        GameObject objBoton = GameObject.Find("BotonPausa");
        
        if (objBoton != null)
        {
            Button btn = objBoton.GetComponent<Button>();
            if (btn != null)
            {
                btn.onClick.RemoveAllListeners();
                btn.onClick.AddListener(BotonPausaPulsado);
            }
        }
        
        AplicarColorGuardado();
    }
    
    public void CargarFantasma(string jsonGhostData)
    {
        if (string.IsNullOrEmpty(jsonGhostData))
        {
            ghostDataActual = null;
            return;
        }

        try
        {
            ghostDataActual = JsonUtility.FromJson<LevelGhostData>(jsonGhostData);
            Debug.Log("¡Fantasma cargado con éxito en Unity!");
        }
        catch (System.Exception e)
        {
            Debug.LogError("Error al parsear fantasma: " + e.Message);
            ghostDataActual = null;
        }
    }
    
    public void AplicarColorGuardado()
    {
        int colorGuardado = PlayerPrefs.GetInt("CarColorIndex", 0);
        GameObject jugadorObj = GameObject.FindWithTag("Player");
        if (jugadorObj != null)
        {
            CarColorController controlador = jugadorObj.GetComponent<CarColorController>();
            if (controlador != null)
            {
                controlador.AplicarMaterial(colorGuardado);
            }
        }
    }

    public void CargarNivelDesdeWeb(int indiceNivel)
    {
        Time.timeScale = 1f; 
        AudioListener.pause = false;
        SceneManager.LoadScene(indiceNivel);
    }
    
    public void ReiniciarNivelActual()
    {
        Time.timeScale = 1f;
        AudioListener.pause = false;
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
    
    public void CambiarColorCarro(int indiceColor)
    {
        PlayerPrefs.SetInt("CarColorIndex", indiceColor);
        PlayerPrefs.Save();
    
        GameObject jugadorObj = GameObject.FindWithTag("Player");
        if (jugadorObj != null)
        {
            CarColorController controlador = jugadorObj.GetComponent<CarColorController>();
            if (controlador != null)
            {
                controlador.AplicarMaterial(indiceColor);
            }
        }
        else
        {
            CarColorController controlador = FindObjectOfType<CarColorController>();
            if (controlador != null)
            {
                controlador.AplicarMaterial(indiceColor);
            }
        }
    }
    
    public void PausarJuego()
    {
        Time.timeScale = 0f;
        AudioListener.pause = true;
    }
    
    
    public void ReanudarJuego()
    {
        Time.timeScale = 1f;
        AudioListener.pause = false;
    }

    [DllImport("__Internal")]
    private static extern void AvisarNivelCompletadoJS(int estrellas);

    [DllImport("__Internal")]
    private static extern void AbrirMenuPausaJS();

    [DllImport("__Internal")]
    private static extern void AvisarNivelFallidoJS();

    public void BotonPausaPulsado()
    {
        PausarJuego(); 
#if UNITY_WEBGL && !UNITY_EDITOR
        AbrirMenuPausaJS();
#else
        Debug.Log("[SIMULACIÓN WEB] Menú de pausa abierto.");
#endif
    }

    public void FinalizarNivel(int estrellasObtenidas)
    {
        PausarJuego(); 
#if UNITY_WEBGL && !UNITY_EDITOR
        AvisarNivelCompletadoJS(estrellasObtenidas);
#else
        Debug.Log($"[SIMULACIÓN WEB] Nivel completado: {estrellasObtenidas} estrellas.");
#endif
    }

    public void NivelFallido()
    {
        PausarJuego(); 
#if UNITY_WEBGL && !UNITY_EDITOR
        AvisarNivelFallidoJS();
#else
        Debug.Log("[SIMULACIÓN WEB] Nivel Fallido.");
#endif
    }
}