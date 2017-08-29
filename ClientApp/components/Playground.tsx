import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Mesh, Scene, Vector3, HemisphericLight, Light, Color3, ArcRotateCamera,
    StandardMaterial, DirectionalLight, FreeCamera, ShaderMaterial, Engine, ShadowGenerator,
    HighlightLayer, IHighlightLayerOptions
} from 'babylonjs'
import { ApplicationState } from '../store';
import { MeshClearedAction, MESH_CLEARED, PlaygroundState, actionCreators } from '../store/Playground';

import { Scene as ReactScene, registerHandler, removeHandler } from 'react-babylonjs'

type PlaygroundProps =
    PlaygroundState
    & typeof actionCreators
    & RouteComponentProps<{}>;

class Playground extends React.Component<PlaygroundProps, {}> {

    private light: Light
    private highlightLayer: HighlightLayer
    private highlightedMeshName: string | undefined
    private actionHandler: (action: any) => boolean
    private scene?: Scene

    onCanvasMouseOver = (e: any) => {
        const mouseOverIntensity = 0.5
        console.log(`adjusting intensity of '${this.light.name}' from ${this.light.intensity} to ${mouseOverIntensity}.`)
        this.light.intensity = mouseOverIntensity
    }

    onCanvasMouseOut = (e: any) => { // TODO: find out the type??
        const mouseOutIntensity = 0.3
        console.log(`adjusting intensity of '${this.light.name}' from ${this.light.intensity} to ${mouseOutIntensity}.`)
        this.light.intensity = mouseOutIntensity
    }

    onSceneMount = (e: any) => { // TODO: make a Type
        // const { canvas, scene, engine } = e
        let canvas: HTMLElement = e.canvas
        let scene: Scene = e.scene
        let engine: Engine = e.engine

        this.scene = scene // we need a reference in our middleware listener

        const { lights, camera } = this.initEnvironment(canvas, scene)

        this.highlightLayer = new HighlightLayer("gameboard-highlight", scene, {
            mainTextureFixedSize: 1024,
            camera
        } as IHighlightLayerOptions)
        this.highlightedMeshName = undefined

        // Copied from default playground.
        // BJS built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = Mesh.CreateSphere("sphere1", 16, 2, scene)
        let sphereMaterial = new StandardMaterial('sphereMaterial', scene)

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // make sphere orange.
        sphereMaterial.diffuseColor = Color3.FromInts(255, 165, 0) // orange
        sphereMaterial.specularColor = Color3.Black() // matte
        sphere.material = sphereMaterial

        // add shadows and have the circle participate in shadow generation
        let shadowGenerator = new ShadowGenerator(1024 /* size of shadow map */, lights.shadowLight)
        shadowGenerator.bias = 0.01
        shadowGenerator.useBlurVarianceShadowMap = true
        shadowGenerator.getShadowMap().renderList.push(sphere)

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);
        ground.receiveShadows = true

        engine.runRenderLoop(() => {
            if (scene) {
                scene.render()
            }
        })
    }

    initEnvironment(canvas: HTMLElement, scene: Scene) {
        // Hemispheric light to light the scene (Hemispheric mimics sunlight)
        let hemiLight = new HemisphericLight("hemiLight1", new Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.5; // 'sunlight' too bright will hide shadows!!

        // Need directional light to create shadows.
        var shadowLight = new DirectionalLight('directionalLight1', new Vector3(1, -0.75, 1), scene)
        shadowLight.position = new Vector3(-40, 30, -40)
        shadowLight.intensity = 1.0

        this.light = hemiLight // we dim/increase this light with mouse over/out canvas.

        // This is a gradient skybox.  Rotate the arc camera up/down to see blue sky.
        var skybox = Mesh.CreateSphere('skyBox', 20, 2000, scene)
        var shader = new ShaderMaterial('gradient', scene, 'gradient', {})
        shader.setFloat('offset', 200)
        shader.setColor3('topColor', Color3.FromInts(0, 119, 255))
        shader.setColor3('bottomColor', Color3.FromInts(60, 60, 60))
        shader.backFaceCulling = false
        skybox.material = shader

        // var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
        let camera = new ArcRotateCamera('Camera', 0, 1.05, 10, Vector3.Zero(), scene)
        camera.lowerRadiusLimit = 5
        camera.upperRadiusLimit = 25
        camera.upperBetaLimit = Math.PI / 2
        camera.setTarget(Vector3.Zero())
        camera.attachControl(canvas, true)

        return {
            lights: {
                hemiLight,
                shadowLight
            },
            camera
        }
    }
    onMeshPicked = (mesh: Mesh, scene: Scene) => {
        this.props.clickedOnMesh(mesh.name)

        if (mesh.name !== 'skyBox') {
            const meshName : string = mesh.name
            if (this.highlightedMeshName !== undefined) {
                let highlightedMesh = scene.getMeshByName(this.highlightedMeshName) as Mesh
                this.highlightLayer.removeMesh(highlightedMesh)
            }

            this.highlightedMeshName = meshName
            let highlightedMesh = scene.getMeshByName(this.highlightedMeshName) as Mesh
            this.highlightLayer.addMesh(highlightedMesh, Color3.Green())
        }
    }

    componentDidMount() {

        // you can add listeners to redux actions - they are intercepted by the middleware
        let handlers = {
            [MESH_CLEARED]: (action: MeshClearedAction) => {
                if (this.highlightedMeshName !== undefined && this.scene !== undefined) {
                    let highlightedMesh = this.scene.getMeshByName(this.highlightedMeshName) as Mesh
                    this.highlightLayer.removeMesh(highlightedMesh)
                    console.log(`Cleared selection '${this.highlightedMeshName}' (in Playground).`)
                    this.highlightedMeshName = undefined
                    
                } else {
                    console.log('Cannot clear selection - (nothing selected or scene is undefined).')
                }
                return true   
            }
        }

        this.actionHandler = (action: any) => {
            let handler = handlers[action.type]
            if (handler) {
                return handler(action)
            } else {
                console.log(`no handler defined in babylonJS scene for ${action.type}`, handlers)
                return false                
            }
        }

        registerHandler(this.actionHandler)
    }

    componentWillUnmount() {
        if (this.scene) {
            this.scene.dispose()
        }
        this.scene = undefined
        removeHandler(this.actionHandler)
    }

    public render() {
        return <div>
            <h1>Playground</h1>
            <div>
                <button disabled={this.props.lastClickedMeshName === ''} onClick={() => { this.props.clearSelection() }}>Clear</button >
                &nbsp;
                {this.props.lastClickedMeshName === '' &&
                    <span key='lastClicked'>Click on sphere or ground (the rest is a skybox with gradient)</span>
                }
                {this.props.lastClickedMeshName !== '' &&
                    <span key='lastClicked'>You last clicked on: {this.props.lastClickedMeshName}</span>
                }
            </div>
            <ReactScene
                onSceneMount={this.onSceneMount}
                visible={true}
                onMeshPicked={this.onMeshPicked}
                shadersRepository={'/shaders/'}
                onFocus={this.onCanvasMouseOver}
                onBlur={this.onCanvasMouseOut}
                engineOptions={{
                    stencil: true // needed for HighlightLayer
                }}
            />
        </div>;
    }
}

// Wire up the React component to the Redux store
export default connect(
    (state: ApplicationState) => state.playground, // Selects which state properties are merged into the component's props
    actionCreators                 // Selects which action creators are merged into the component's props
)(Playground) as typeof Playground;