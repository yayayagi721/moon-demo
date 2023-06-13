import * as THREE from "three";

import { Face } from "./face";
import { getNormedHightPxByLatLng } from "./demRepository";
import { pointToCoordinate } from "./coordinateHelper";
import fragmentShader from "./shader/fragmentShader.glsl";
import vertexShader from "./shader/vertexShader.glsl";

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

	public async applyHeight( point: THREE.Vector3 ) {

		const coord = pointToCoordinate( point );

		const height = getNormedHightPxByLatLng( coord ) * 0.000004;
		const v = new THREE.Vector3().copy( point ).multiplyScalar( height );

		return new THREE.Vector3().copy( point ).add( v );

	}

	getHeight( point: THREE.Vector3 ) {

		const coord = pointToCoordinate( point );
		const height = getNormedHightPxByLatLng( coord );
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
