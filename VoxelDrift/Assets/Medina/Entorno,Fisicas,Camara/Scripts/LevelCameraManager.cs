using UnityEngine;
using Unity.Cinemachine; // Namespace para Cinemachine 3

public class LevelCameraManager : MonoBehaviour
{
    [SerializeField] private CinemachineCamera camaraSuelo;
    [SerializeField] private CinemachineCamera camaraPared;

    private void OnEnable()
    {
        Sticky_Tile.OnWallTransition += AlternarCamara;
    }

    private void OnDisable()
    {
        Sticky_Tile.OnWallTransition -= AlternarCamara;
    }

    private void AlternarCamara(bool enPared)
    {
        if (enPared)
        {
            // Al darle mayor prioridad (20 > 10), Cinemachine hace la transición suave
            camaraPared.Priority = 20; 
        }
        else
        {
            // Al volverla a 0, Cinemachine regresa suavemente a la camaraSuelo (10)
            camaraPared.Priority = 0; 
        }
    }
}