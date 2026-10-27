using System;
using UnityEngine;
using Unity.Cinemachine;

public class GrappleCameraFeedback : MonoBehaviour
{
    [SerializeField] private CarData data;
    [SerializeField] private LayerMask layerPuntosEnganche;
    [SerializeField] private GameObject miraUI;
    [SerializeField] private CinemachineTargetGroup targetGroup;
    [SerializeField] private float velocidadSuavizado = 5f;

    private Transform objetivoActual;
    private Camera camaraPrincipal;
    private float pesoActual = 0f;

    void Start()
    {
        camaraPrincipal = Camera.main;
    }

    private void Update()
    {
        float distanciaMasCercana = Mathf.Infinity;
        Transform objetivoMasCercano = null;

        Collider[] enganchesEncontrados = Physics.OverlapSphere(transform.position, data.radioParaEngancharse, layerPuntosEnganche);

        foreach (Collider col in enganchesEncontrados)
        {
            Vector3 coordenadasColliders = col.ClosestPoint(transform.position);
            float distanciaConCarro = Vector3.Distance(transform.position, coordenadasColliders);

            if (distanciaConCarro < distanciaMasCercana)
            {
                distanciaMasCercana = distanciaConCarro;
                objetivoMasCercano = col.transform;
            }
        }

        objetivoActual = objetivoMasCercano;

        float pesoObjetivo = (objetivoActual != null) ? 0.5f : 0f;

        if (objetivoActual != null)
        {
            targetGroup.Targets[1].Object = objetivoActual;
        }

        pesoActual = Mathf.Lerp(pesoActual, pesoObjetivo, Time.deltaTime * velocidadSuavizado);
        targetGroup.Targets[1].Weight = pesoActual;

        if (pesoActual < 0.01f)
        {
            targetGroup.Targets[1].Object = null;
        }
    }

    private void LateUpdate()
    {
        if (objetivoActual != null && pesoActual > 0.05f)
        {
            Vector3 posicionPantalla = camaraPrincipal.WorldToScreenPoint(objetivoActual.position);

            if (posicionPantalla.z > 0)
            {
                miraUI.SetActive(true);
                miraUI.transform.position = posicionPantalla;
            }
            else
            {
                miraUI.SetActive(false);
            }
        }
        else
        {
            miraUI.SetActive(false);
        }
    }
}