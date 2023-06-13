type Coordinate = {
  lat: number;
  lng: number;
};

declare module "geotiff-geokeys-to-proj4/main.js" {
  export * from "geotiff-geokeys-to-proj4";
}

declare module "*.glsl" {
  const value: string;
  export default value;
}
