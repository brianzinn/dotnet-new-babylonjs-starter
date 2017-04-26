import * as React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
    Mesh, Scene, Vector3, HemisphericLight, Light, Color3, ArcRotateCamera,
    StandardMaterial, DirectionalLight, FreeCamera, ShaderMaterial, Engine, ShadowGenerator
} from 'babylonjs'
import { ApplicationState } from '../store';
import * as PlaygroundStore from '../store/Playground';

import { Scene as ReactScene } from 'react-babylonjs'


type PlaygroundProps = PlaygroundStore.PlaygroundState & typeof PlaygroundStore.actionCreators;

class Playground extends React.Component<PlaygroundProps, void> {

    private light: Light

    onCanvasMouseOver = (e) => {
        const mouseOverIntensity = 0.5
        console.log(`adjusting intensity of '${this.light.name}' from ${this.light.intensity} to ${mouseOverIntensity}.`)
        this.light.intensity = mouseOverIntensity
    }

    onCanvasMouseOut = (e) => {
        const mouseOutIntensity = 0.3
        console.log(`adjusting intensity of '${this.light.name}' from ${this.light.intensity} to ${mouseOutIntensity}.`)
        this.light.intensity = mouseOutIntensity
    }

    onSceneMount = (e) => {
        // const { canvas, scene, engine } = e
        let canvas: HTMLElement = e.canvas
        let scene: Scene = e.scene
        let engine: Engine = e.engine

        const { lights, camera } = this.initEnvironment(canvas, scene)

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
    }

    public render() {
        return <div>
            <h1>Playground</h1>
            <div>
                <button disabled={this.props.lastClickedMeshName === ''} onClick={() => { this.props.clearName() }}>Clear</button >
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
            />
        </div>;
    }
}

// Wire up the React component to the Redux store
export default connect(
    (state: ApplicationState) => state.playground, // Selects which state properties are merged into the component's props
    PlaygroundStore.actionCreators                 // Selects which action creators are merged into the component's props
)(Playground);