import { GeoTIFFImage, fromUrl, ReadRasterResult } from "geotiff";
import * as geokeysToProj4 from "geotiff-geokeys-to-proj4";
import proj4 from "proj4";

let image: GeoTIFFImage = null;
let projection = null;
let imageData: ReadRasterResult = null;

// sample url
const url = "https://image-cog.s3.ap-northeast-1.amazonaws.com/moon1_0.tiff";

// pixel maximum
const uint16Max = 65535;

export const initMoonDEMData = async () => {

	const tiff = await fromUrl( url );

	image = await tiff.getImage();
	const geoKeys = image.getGeoKeys();
	const projObj = geokeysToProj4.toProj4( geoKeys );
	projection = proj4( `WGS84`, projObj.proj4 );

	imageData = await image.readRasters( {
		interleave: true,
		samples: [ 0 ],
	} );

};

export const getNormedHightPxByLatLng = ( coordinate: Coordinate ): number => {

	const { x, y } = projection.forward( {
		x: coordinate.lng,
		y: coordinate.lat,
	} );

	const width = image.getWidth();
	const height = image.getHeight();

	const [ originX, originY ] = image.getOrigin();
	const [ xSize, ySize ] = image.getResolution();
	const uWidth = xSize * width;
	const uHeight = ySize * height;

	const percentX = ( x - originX ) / uWidth;
	const percentY = ( y - originY ) / uHeight;

	const pixelX = Math.floor( width * percentX );
	const pixelY = Math.floor( height * percentY );

	const value = imageData[ width * pixelY + pixelX ];

	return <number>value / uint16Max;

};
