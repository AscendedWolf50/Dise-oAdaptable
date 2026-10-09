using UnityEngine;

public class LevelManager : MonoBehaviour
{
    [SerializeField] private LevelData data;


    void OnEnable()
    {
        FinishLine.OnNivelCompletado += ProcesarCompletacion;
    }

    void OnDisable()
    {
        FinishLine.OnNivelCompletado -=  ProcesarCompletacion;
    }



    private void ProcesarCompletacion()
    {
        SaveData datosGuardados = CargarDatos();
        
        LevelProgress progresoActual = datosGuardados.niveles.Find(n => n.idNivel == data.idNivel); //Buscar si ya tiene un registro en el nivel

        if (progresoActual == null)
        {
            progresoActual = new LevelProgress{idNivel = data.idNivel};
            
            datosGuardados.niveles.Add(progresoActual);
        }

        progresoActual.estrellaCompletado = true;
        
        GuardarDatos(datosGuardados);
        
        Debug.Log($"Nivel {data.idNivel} completado. Estrella 1 conseguida.");
        
        
    }


    private SaveData CargarDatos()
    {
        if (PlayerPrefs.HasKey("UserProgress"))
        {
            string json = PlayerPrefs.GetString("UserProgress");
            
            return  JsonUtility.FromJson<SaveData>(json);
        }
        
        return new SaveData();
    }

    private void GuardarDatos(SaveData datos)
    {
        string json = JsonUtility.ToJson(datos);
        PlayerPrefs.SetString("UserProgress", json);
        PlayerPrefs.Save();
    }
    
}
