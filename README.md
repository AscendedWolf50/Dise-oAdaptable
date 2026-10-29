# Dise-oAdaptable

https://ascendedwolf50.github.io/Dise-oAdaptable/

# Voxel Drift

<img width="1317" height="745" alt="image" src="https://github.com/user-attachments/assets/ab55d08c-b29a-48cb-a512-b511635a3862" />


**Voxel Drift** es un juego de plataformas y desplazamiento lateral (2.5D) centrado en la conducción y acrobacias de un vehículo en 3D. El proyecto destaca por su arquitectura híbrida, combinando el motor de física y renderizado de **Unity WebGL** con una interfaz de usuario web moderna desarrollada en **React** y **Tailwind CSS**, junto con una infraestructura social y de persistencia impulsada por **Firebase**.

---

## Mecánicas de Juego Principal
* **Acrobacias y Trucos Aéreos:** Realiza giros, volteretas y piruetas en el aire para encadenar combos y acumular la máxima puntuación posible.
* **Conducción en Paredes (*Wall Driving*):** Desafía la gravedad adhiriéndote a superficies verticales e invertidas para superar obstáculos.
* **Gancho de Agarre (*Grappling Hook*):** Utiliza un gancho dinámico para balancearte a través de grandes vacíos, ajustar trayectorias a alta velocidad y alcanzar plataformas elevadas.

<img width="1302" height="595" alt="ConfiMobile" src="https://github.com/user-attachments/assets/f2fcdb96-7d0b-42ac-bf2e-c3120af939a4" />

---

## Arquitectura y Tecnologías

El proyecto utiliza una integración fluida entre la capa del motor de juego y el ecosistema web nativo.

```
+-------------------------------------------------------------+
|                      Capaz de Aplicación Web                |
|                    (React + Tailwind CSS)                   |
+------------------------------+------------------------------+
                               |
                   [ Bridge / Event Listeners ]
                               |
+------------------------------v------------------------------+
|                      Lienzo de Juego                        |
|                        (Unity WebGL)                        |
+------------------------------+------------------------------+
                               |
                     [ SDK / Firestore API ]
                               |
+------------------------------v------------------------------+
|                     Servicios Backend                       |
|                         (Firebase)                          |
+-------------------------------------------------------------+
```

### Stack Tecnológico
* **Motor de Juego:** Unity (Build nativa WebGL).
* **Frontend Web:** React + Tailwind CSS para una interfaz intuitiva, responsiva y de alto rendimiento.
* **Backend y Persistencia:** Firebase (Authentication, Cloud Firestore, Realtime Database).

### Integración WebGL & React
A diferencia de las ejecuciones WebGL tradicionales donde la interfaz se dibuja en el propio canvas del juego, *Voxel Drift* utiliza **interfaces nativas HTML/React**:
* Menús principales, HUDs externos, modales de configuración y paneles sociales corren nativamente sobre la web.
* Comunicación bidireccional continua entre la build de Unity y la capa de React para sincronizar estados de juego, pausas, puntuaciones y datos de telemetría.

---

## Funcionalidades Sociales y Nube (Firebase)

El sistema backend en la nube proporciona una experiencia conectada y competitiva:

* **Gestión de Progreso en la Nube:** Guardado automático de nivel, récords de puntuación, desbloqueables y tiempos de carrera.
* **Lista de Amigos & Chat en Tiempo Real:** Interfaz integrada para gestionar amigos, ver su estado de conexión y comunicarse mediante chat nativo.
* **Modo Fantasma (*Ghost Racing*):**
  * Registra la telemetría y los datos de posición/rotación del vehículo durante la mejor partida de cada jugador.
  * Permite seleccionar a cualquier amigo de la lista para competir de forma asíncrona contra el "fantasma" de su mejor recorrido en el escenario.
 
<img width="1049" height="489" alt="image" src="https://github.com/user-attachments/assets/bc2c0366-a154-4857-8cf1-ffb94cf664ca" />

