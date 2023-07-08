import "./style.scss";

import { initMoonDEMData } from "./demRepository";
import { saveAs } from "file-saver";

import * as dat from "lil-gui";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
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

	return [ uniforms, gui ];

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

	// Instantiate a exporter
	const exporter = new GLTFExporter();

	console.log( exporter );


	const link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link );

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();

	}

	const saveArrayBuffer = ( buffer, filename ) =>{

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	};

	const obj = {
		myFunction: () => {

			// Parse the input and generate the glTF output
			const buffer = exporter.parse(
				scene,
				// called when the gltf has been generated
				function ( gltf ) {

					console.log( gltf );
					if ( gltf instanceof ArrayBuffer ) {

					  saveArrayBuffer( gltf, "mesh.glb" );

					}

				},
				// called when there is an error in the generation
				function ( error ) {

					console.log( 'An error happened' );

				},
				{ trs: true,
					binary: true, }
			);

			console.log( buffer );

		},
	};


	scene.background = new THREE.Color( "#FFFFFF" );

	await initMoonDEMData();
	const [ uniforms, gui ] = initUniforms();

	gui.add( obj, "myFunction" ); // button


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
