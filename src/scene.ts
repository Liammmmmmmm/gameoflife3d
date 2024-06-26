import GUI from 'lil-gui'
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Color,
  //Clock,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
  RectAreaLight
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
// import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'

import { getGrid, fullRenderSize } from './gameoflife';

//import gsap from 'gsap'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
//let clock: Clock
let stats: Stats
let gui: GUI
let generation: number = 0;
let rectLight: RectAreaLight;

const sideLength = 0.95
const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
const cubeMaterial = new MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0,
  roughness: 1,
})

function addGeneration() {
  let cubex = -fullRenderSize/2 - 0.5;
  let cubez = -fullRenderSize/2 - 0.5;

  getGrid().forEach(row => {
    cubez++;
    cubex = -fullRenderSize/2 - 0.5;
    
    const cubeNames: number[] = []
    row.forEach((column) => {
      cubex++;
      if(column == 1) {
        let cubelife: Mesh
        cubelife = new Mesh(cubeGeometry, cubeMaterial)
        cubelife.castShadow = true
        cubelife.position.y = 0.5 + generation;
        cubelife.position.x = cubex;
        cubelife.position.z = cubez;

        //renderer.renderLists.dispose();
        //const dateNow = `cube-${Date.now().toString()}`

        //cubelife.name = dateNow
        cubeNames.push(cubelife.id)
        

        scene.add(cubelife)

        

        // setTimeout(() => {
        //   //cubelife.removeFromParent()
        //   // cubelife.geometry.dispose();
        //   // scene.remove( cubelife );
        // }, 2)
      }
    })

    setTimeout(() => {
      cubeNames!.map((i) => {
        const objI = scene.getObjectById(i)
        if (objI) {
          //objI.remove(self)


          scene.remove(objI)

        }
      });
    }, 800)
  })
  generation++;
  rectLight.position.y = rectLight.position.y + 1;

  cube.position.y = cube.position.y + 1;
  camera.position.y = camera.position.y + 1;
  

  // gsap.to(cube.position, {y: cube.position.y+1, duration: 0.1});
  // gsap.to(camera.position, {y: camera.position.y+1, duration: 0.1});

}

const animation = { enabled: true, play: true }

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()
    //scene.background = new Color(0xffffff)
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()

    loadingManager.onStart = () => {
      console.log('loading started')
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:')
      console.log(`${url} -> ${loaded} / ${total}`)
    }
    loadingManager.onLoad = () => {
      console.log('loaded!')
    }
    loadingManager.onError = () => {
      console.log('❌ error while loading')
    }
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4)
    pointLight = new PointLight('white', 100, 1000)
    pointLight.position.set(25, 25, 0)
    pointLight.castShadow = true
    pointLight.shadow.radius = 200
    pointLight.shadow.camera.near = 100.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)

    const width = 40;
    const height = 10000;
    const intensity = 1;
    rectLight = new RectAreaLight( 0xffffff, intensity,  width, height );
    rectLight.position.set( 30, 5, 0 );
    rectLight.lookAt( 0, 0, 0 );
    scene.add( rectLight )


  }

  // ===== 📦 OBJECTS =====    
  {
    const cubeMaterialCamera = new MeshStandardMaterial({
      color: 'white',
      side: 2,
      transparent: true,
      opacity: 0,
    })
    cube = new Mesh(cubeGeometry, cubeMaterialCamera)
    cube.castShadow = true
    cube.position.y = 8
    
    const planeGeometry = new PlaneGeometry(3, 3)
    const planeMaterial = new MeshLambertMaterial({
      color: 'gray',
      emissive: 'teal',
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    })
    const plane = new Mesh(planeGeometry, planeMaterial)
    plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true
  
    
   
    
    
    scene.add(plane)
  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200)
    camera.position.set(32, 32, 50)
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.target = cube.position.clone()
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()

    dragControls = new DragControls([cube], camera, renderer.domElement)
    dragControls.addEventListener('hoveron', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('orange')
    })
    dragControls.addEventListener('hoveroff', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
    })
    dragControls.addEventListener('dragstart', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      cameraControls.enabled = false
      animation.play = false
      material.emissive.set('black')
      material.opacity = 0.7
      material.needsUpdate = true
    })
    dragControls.addEventListener('dragend', (event) => {
      cameraControls.enabled = true
      animation.play = true
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
      material.opacity = 1
      material.needsUpdate = true
    })
    dragControls.enabled = false

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    })
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(4)
    axesHelper.visible = false
    scene.add(axesHelper)

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
    pointLightHelper.visible = false
    scene.add(pointLightHelper)

    const gridHelper = new GridHelper(fullRenderSize, fullRenderSize, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    scene.add(gridHelper)
  }

  // ===== 📈 STATS & CLOCK =====
  {
    //clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const cubeOneFolder = gui.addFolder('Cube one')

    cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    cubeOneFolder.add(cube.position, 'y').min(-5).max(5).step(0.5).name('pos y')
    cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

    cubeOneFolder.add(cube.material, 'wireframe')
    cubeOneFolder.addColor(cube.material, 'color')
    cubeOneFolder.add(cube.material, 'metalness', 0, 1, 0.1)
    cubeOneFolder.add(cube.material, 'roughness', 0, 1, 0.1)

    cubeOneFolder
      .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate x')
    cubeOneFolder
      .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate y')
    cubeOneFolder
      .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate z')

    cubeOneFolder.add(animation, 'enabled').name('animated')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(dragControls, 'enabled').name('drag controls')

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')

    gui.close()
  }
}

function animate() {
  requestAnimationFrame(animate)

  //addGeneration()

  stats.update()

  if (animation.enabled && animation.play) {
   
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.target = cube.position.clone()
  cameraControls.update()

  renderer.render(scene, camera)

  addGeneration()
}

// setInterval(() => {
  //addGeneration()
// }, 100)