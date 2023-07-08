import * as THREE from "three";

export class Face {

	geometry: THREE.BufferGeometry;
	resolution: number;
	localUp: THREE.Vector3;

	axisA: THREE.Vector3;
	axisB: THREE.Vector3;

	vertexVectors: THREE.Vector3[];
	indexes: number[];

	onEachPointForDem: ( coordinate: Coordinate ) => number;

	constructor( resolution: number, localUp: THREE.Vector3 ) {

		this.resolution = resolution;
		this.localUp = localUp;

		this.axisA = new THREE.Vector3( localUp.y, localUp.z, localUp.x );

		this.axisB = new THREE.Vector3().copy( localUp ).cross( this.axisA );

		this.vertexVectors = [];
		this.indexes = [];

	}

	circP( p ) {

		return new THREE.Vector3()
			.copy( p )
			.divideScalar( Math.sqrt( p.x * p.x + p.y * p.y + p.z * p.z ) );

	}

	pointOnCubeToPointOnSphere( p ) {

		const x2 = p.x * p.x;
		const y2 = p.y * p.y;
		const z2 = p.z * p.z;
		const x = p.x * Math.sqrt( 1 - ( y2 + z2 ) / 2 + ( y2 * z2 ) / 3 );
		const y = p.y * Math.sqrt( 1 - ( z2 + x2 ) / 2 + ( z2 * x2 ) / 3 );
		const z = p.z * Math.sqrt( 1 - ( x2 + y2 ) / 2 + ( x2 * y2 ) / 3 );
		return new THREE.Vector3( x, y, z );

	}

	public constructMesh() {

		const verticesVector = [];

		for ( let y = 0; y < this.resolution; y ++ ) {

			for ( let x = 0; x < this.resolution; x ++ ) {

				const index = x + y * this.resolution;
				const percent = new THREE.Vector2( x, y ).divideScalar(
					this.resolution - 1
				);

				const _localUp = new THREE.Vector3().copy( this.localUp );

				const _axisA = new THREE.Vector3().copy( this.axisA );
				const _axisB = new THREE.Vector3().copy( this.axisB );

				const pointOnUnitCube = new THREE.Vector3()
					.copy( _localUp )
					.add(
						new THREE.Vector3()
							.copy( _axisA )
							.multiplyScalar( ( percent.x - 0.5 ) * 2 )
					)
					.add(
						new THREE.Vector3()
							.copy( _axisB )
							.multiplyScalar( ( percent.y - 0.5 ) * 2 )
					);

				const circed = this.pointOnCubeToPointOnSphere( pointOnUnitCube );

				this.vertexVectors.push( circed );

				if ( x !== this.resolution - 1 && y !== this.resolution - 1 ) {

					this.indexes.push( index );
					this.indexes.push( index + this.resolution + 1 );
					this.indexes.push( index + this.resolution );

					this.indexes.push( index );
					this.indexes.push( index + 1 );
					this.indexes.push( index + this.resolution + 1 );

				}

			}

		}

	}

	public createGeometry() {

		const _vertices = [];
		this.vertexVectors.forEach( ( vector ) => {

			_vertices.push( vector.x );
			_vertices.push( vector.y );
			_vertices.push( vector.z );

		} );

		const _normals = [];
		this.vertexVectors.forEach( ( vector ) => {

			const norm = new THREE.Vector3().copy( vector ).normalize();
			_normals.push( norm.x );
			_normals.push( norm.y );
			_normals.push( norm.z );

		} );

		const vertices = new Float32Array( _vertices );
		const normals = new Float32Array( _normals );

		const indexes = new Uint32Array( this.indexes );

		const geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

		//頂点座標
		geometry.setAttribute( "position", new THREE.BufferAttribute( vertices, 3 ) );

		//頂点のつなげ順
		geometry.setIndex( new THREE.BufferAttribute( indexes, 1 ) );

		// 法線
		geometry.setAttribute( "normal", new THREE.BufferAttribute( normals, 3 ) );

		//
		geometry.setAttribute( "dem", new THREE.BufferAttribute( normals, 3 ) );

		geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
		geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );

		// Load the texture asynchronously
		const sprite = new THREE.TextureLoader().load( '../assets/img/new-1.jpg' );

		var material = new THREE.MeshBasicMaterial( { map: sprite } );

		return geometry;

	}

}
