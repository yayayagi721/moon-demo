uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vHeight;

void main(){
    vec3 color=mix(uDepthColor,uSurfaceColor,vHeight+.1);
    gl_FragColor=vec4(color,1.);
}