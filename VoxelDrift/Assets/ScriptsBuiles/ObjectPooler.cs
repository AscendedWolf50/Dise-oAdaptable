using System.Collections.Generic;
using UnityEngine;

public class ObjectPooler : MonoBehaviour // Clase que se encarga de crear un pool de objetos (para poder reutilizar los objetos y no tener que instanciarlos y destruirlos constantemente, lo que puede afectar el rendimiento del juego)
{
    [SerializeField] private GameObject prefab;

    [SerializeField] private int poolSize = 5; // Variable que indica el tamaño del pool de objetos (la cantidad de objetos que se van a crear y almacenar en el pool)

    private List <GameObject> _pool; // Lista que almacena los objetos del pool (para poder acceder a ellos y reutilizarlos cuando sea necesario)
   
    void Awake()
    {
        _pool = new List<GameObject>(); // Inicializar la lista que almacena los objetos del pool 

        for (int i = 0; i < poolSize; i++) // Bucle que se ejecuta la cantidad de veces que indica el tamaño del pool de objetos (para crear y almacenar los objetos en el pool)
        {
            CreateNewObject();
        }
    }

    private GameObject CreateNewObject()
    {
        GameObject obj = Instantiate(prefab); // Instanciar un nuevo objeto a partir del prefab 

        obj.SetActive(false); // Desactivar el objeto instanciado (para que no se muestre en la escena y no afecte el rendimiento del juego)

        _pool.Add(obj); // Agregar el objeto instanciado a la lista que almacena los objetos del pool 

        return obj; // Devolver el objeto instanciado 

    }

    public GameObject GetObject() // Metodo que devuelve un objeto del pool (para poder reutilizarlo cuando sea necesario)
    {
        

        foreach (GameObject obj in _pool) // Bucle que recorre la lista que almacena los objetos del pool (para buscar un objeto que este desactivado y pueda ser reutilizado)
        {
            if (!obj.activeInHierarchy) // Si el objeto no esta activo en la jerarquia (es decir, si esta desactivado y puede ser reutilizado)
            {
                return obj; // Devolver el objeto desactivado (para poder reutilizarlo cuando sea necesario)
            }

        }

        return CreateNewObject(); // Si no hay ningun objeto desactivado en la lista que almacena los objetos del pool, se crea un nuevo objeto y se devuelve (para poder reutilizarlo cuando sea necesario)

        
    }

    
}