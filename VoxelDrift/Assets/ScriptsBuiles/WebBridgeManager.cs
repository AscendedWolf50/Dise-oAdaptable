using UnityEngine;
using UnityEngine.SceneManagement;
using System.Runtime.InteropServices;

public class WebBridgeManager : MonoBehaviour
{

    private static WebBridgeManager instancia;

    void Awake()
    {
        if (instancia == null)
        {
            instancia = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);

        }
    }
    
    public void CargarNivelDesdeWeb(int indiceNivel)
    {
        Debug.Log("La Web ordenó cargar el nivel: " + indiceNivel);
        
        
        Time.timeScale = 1f; 
        AudioListener.pause = false;
        
        SceneManager.LoadScene(indiceNivel);
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

    public void FinalizarNivel(int estrellasObtenidas)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
            AvisarNivelCompletadoJS(estrellasObtenidas);
#else
        Debug.Log($"[SIMULACIÓN EDITOR] Nivel terminado con {estrellasObtenidas} estrellas. Se avisaría a la Web.");
#endif
    }

    
    
}
