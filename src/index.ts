import "./style.scss";

import { initMoonDEMData } from "./demRepository";

import * as dat from "lil-gui";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Planet } from "./planet";

const initUniforms = () => {

	const gui = new dat.GUI( { width: 300 } );

	const colors = {
		depthColor: "#000000",
		surfaceColor: "#cfe1ec",
	};

	const uniforms = {
		uDepthColor: { value: new THREE.Color( colors.depthColor ) },
		uSurfaceColor: { value: new THREE.Color( colors.surfaceColor ) },
		uColorOffset: { value: 0.03 },
		uColorMultiplier: { value: 9.0 },
		uHeightCoefficient: { value: 0.15 },
	};

	gui
		.add( uniforms.uColorOffset, "value" )
		.min( 0 )
		.max( 1 )
		.step( 0.001 )
		.name( "uColorOffset" );

	gui
		.add( uniforms.uColorMultiplier, "value" )
		.min( 0 )
		.max( 10 )
		.step( 0.001 )
		.name( "uColorMultiplier" );

	gui
		.add( uniforms.uHeightCoefficient, "value" )
		.min( 0 )
		.max( 2 )
		.step( 0.001 )
		.name( "uColorMultiplier" );

	gui.addColor( colors, "depthColor" ).onChange( () => {

		uniforms.uDepthColor.value.set( colors.depthColor );

	} );

	gui.addColor( colors, "surfaceColor" ).onChange( () => {

		uniforms.uSurfaceColor.value.set( colors.surfaceColor );

	} );

	gui.show( true );

	return uniforms;

};

const main = async () => {

	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	const canvas = document.querySelector( ".webgl" );

	const renderer = new THREE.WebGLRenderer( {
		antialising: true,
		alpha: false,
		canvas: canvas,
	} );

	renderer.shadowMap.enabled = true;

	const camera = new THREE.PerspectiveCamera(
		45,
		sizes.width / sizes.height,
		0.1,
		1000
	);

	camera.position.set( 0, 0, 2 );
	const scene = new THREE.Scene();

	scene.background = new THREE.Color( "#FFFFFF" );

	await initMoonDEMData();
	const uniforms = initUniforms();

	window.addEventListener( "resize", () => {

		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		renderer.setSize( sizes.width, sizes.height );
		renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

	} );

	const planet = new Planet( 100 );
	const meshes = await planet.initialize( uniforms );

	meshes.forEach( ( mesh ) => {

		scene.add( mesh );
		console.log( mesh );

	} );

	const dir = new THREE.Vector3( 0, 0, 3 );

	//normalize the direction vector (convert to vector of length 1)
	dir.normalize();

	const origin = new THREE.Vector3( 0, 0, 0 );
	const length = 1;
	const hex = 0xff0000;

	const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
	scene.add( arrowHelper );

	// Controls
	const controls = new OrbitControls( camera, canvas );
	controls.enableDamping = true;

	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( sizes.width, sizes.height );

	camera.position.z = 4;

	const update = () => {

		renderer.render( scene, camera );
		requestAnimationFrame( update );

	};

	requestAnimationFrame( update );

};

main();
