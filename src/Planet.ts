import * as THREE from "three";

import { Face } from "./face";
import { getNormedHightPxByLatLng } from "./demRepository";
import { pointToCoordinate } from "./coordinateHelper";
import fragmentShader from "./shader/fragmentShader.glsl";
import vertexShader from "./shader/vertexShader.glsl";
import { log } from "geotiff/dist-node/logging";

const DIRECTION = {
	UP: new THREE.Vector3( 0, 1, 0 ),
	DOWN: new THREE.Vector3( 0, - 1, 0 ),
	LEFT: new THREE.Vector3( - 1, 0, 0 ),
	RIGHT: new THREE.Vector3( 1, 0, 0 ),
	FORWARD: new THREE.Vector3( 0, 0, 1 ),
	BACK: new THREE.Vector3( 0, 0, - 1 ),
};

const vectorDirection = ( direction ) => {

	return new THREE.Vector3().copy( DIRECTION[ direction ] );

};

const MOON_CONST = {
	radiusMeter: 1737.4,
	onePerMeter: 0.5,
};


export class Planet {

	directions: THREE.Vector3[];
	resolution: number;

	constructor( resolution ) {

		this.directions = [
			vectorDirection( "UP" ),
			vectorDirection( "DOWN" ),
			vectorDirection( "LEFT" ),
			vectorDirection( "RIGHT" ),
			vectorDirection( "FORWARD" ),
			vectorDirection( "BACK" ),
		];

		this.resolution = resolution;

	}


	private applyHeight( pxData ) {

		const meterLength = 1 / MOON_CONST.radiusMeter;
		const pxMeter = pxData * MOON_CONST.onePerMeter * meterLength;

		return pxMeter;

	}

	getHeight( point: THREE.Vector3 ) {

		const coord = pointToCoordinate( point );
		const pxData = getNormedHightPxByLatLng( coord );
		const height = this.applyHeight( pxData );

		return height;

	}

	async initialize( uniforms = {} ) {

		const meshPromises = this.directions.map( async ( direction ) => {

			const face = new Face( this.resolution, direction );
			face.constructMesh();

			const geometry = face.createGeometry();

			const demArray = face.vertexVectors.map( ( vector ) => {

				return this.getHeight( vector );

			} );
			const maxHeight = Math.max( ...demArray );

			( <any> uniforms ).uMaxHeight.value = maxHeight;

			const normalizeHeight = new Float32Array( demArray );

			//頂点座標
			geometry.setAttribute(
				"height",
				new THREE.BufferAttribute( normalizeHeight, 1 )
			);

			// shader material
			const material = new THREE.ShaderMaterial( {
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				uniforms,
			} );

			const mesh = new THREE.Mesh( geometry, material );

			mesh.castShadow = true;

			return mesh;

		} );

		const meshes = await Promise.all( meshPromises );

		return meshes;

	}

}

