using UnityEngine;
using UnityEngine.SceneManagement;


public class PanelsManager : MonoBehaviour
{
    
    [SerializeField] private GameObject panelDeDerrota;


    void Start()
    {
        panelDeDerrota.SetActive(false);
    }

    void OnEnable()
    {
        CarDeath.OnCarroDestruido += ActivarPanelDerrota;
    }

    void OnDisable()
    {
        CarDeath.OnCarroDestruido -= ActivarPanelDerrota;
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
