using UnityEngine;
using UnityEngine.SceneManagement;


public class PanelsManager : MonoBehaviour
{
    [SerializeField] private GameObject panelDeVictoria;
    
    [SerializeField] private GameObject panelDeDerrota;


    void Start()
    {
        panelDeDerrota.SetActive(false);
        
        panelDeVictoria.SetActive(false);
    }

    void OnEnable()
    {
        CarDeath.OnCarroDestruido += ActivarPanelDerrota;

        FinishLine.OnNivelCompletado += ActivarPanelVictoria;
    }

    void OnDisable()
    {
        CarDeath.OnCarroDestruido -= ActivarPanelDerrota;
        
        FinishLine.OnNivelCompletado -= ActivarPanelVictoria;
    }

    public void ActivarPanelVictoria()
    {
        Time.timeScale = 0;
        
        panelDeVictoria.SetActive(true);
    }

    public void ActivarPanelDerrota()
    {
        Time.timeScale = 0;
        
        panelDeDerrota.SetActive(true);
    }

    public void ReiniciarNivel()
    {
        panelDeDerrota.SetActive(false);
        
        Time.timeScale = 1;
        
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        
        
    }
    
    
    
}
