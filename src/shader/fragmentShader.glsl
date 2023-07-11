uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform float uMaxHeight;

varying float vHeight;
varying float vRatio;

void main(){
    vec3 color=mix(uDepthColor,uSurfaceColor,vHeight/uMaxHeight);
    if(vHeight/uMaxHeight<vRatio && vRatio<(vHeight/uMaxHeight)+0.1){
        gl_FragColor=vec4(color,1.);
    }else{
        gl_FragColor=vec4(color,0.);
    }
}