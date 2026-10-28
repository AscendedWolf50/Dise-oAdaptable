using UnityEngine;

public class CarColorController : MonoBehaviour
{
    [Header("Materiales disponibles (Arrastra los 8 aquí)")]
    [SerializeField] private Material[] materialesCarro;

    [Header("Renderers a cambiar (Chasis, Retrovisores, etc.)")]
    [SerializeField] private MeshRenderer[] renderersCarroceria;

    private void Start()
    {
        
        int colorGuardado = PlayerPrefs.GetInt("CarColorIndex", 0);
        AplicarMaterial(colorGuardado);
    }

    public void AplicarMaterial(int indiceColor)
    {
        if (materialesCarro == null || materialesCarro.Length == 0) return;

        
        int index = Mathf.Clamp(indiceColor, 0, materialesCarro.Length - 1);
        Material nuevoMaterial = materialesCarro[index];

        
        PlayerPrefs.SetInt("CarColorIndex", index);
        PlayerPrefs.Save();

        
        foreach (MeshRenderer renderer in renderersCarroceria)
        {
            if (renderer != null)
            {
                renderer.material = nuevoMaterial;
            }
        }
    }
}