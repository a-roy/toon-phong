uniform float time;
uniform vec2 resolution;

varying vec4 sPosition;
varying vec3 fPosition;
varying vec3 fNormal;
varying float light;

void main()
{
  vec3 light_position = vec3(0.0,10.0,10);
  vec3 eye_position = vec3(0.0,10.0,-10);
  
  float material_shininess = 0.5;
  float material_kd = 0.8;
  float material_ks = 0.4;
  
  
  // don't forget to normalize
  vec3 L = normalize(light_position - fPosition); // light direction
  vec3 V = normalize(eye_position - fPosition); // view direction
  
  // Lambert term
  float LdotN = max(0.0, dot(L, fNormal));
  
  // consider diffuse light color white(1,1,1)
  // all color channels have the same float value
  float diffuse = material_kd * LdotN;
  float specular = 1.0;
  
  if (LdotN > 0.0)
  {
    // choose H or R to see the difference
    // can use built-in max or saturate function
    // vec3 R = -normalize(reflect(L, fNormal); // reflection
    vec3 R = 2.0 * fNormal * (fNormal - L);
    specular = material_ks * pow(max(0.0, dot(R, V)), material_shininess);
    
    // Blinn-Phong
    vec3 H = normalize(L + V); // Halfway
    specular = material_ks * pow(max(0.0, dot(H, fNormal)), material_shininess);
  }
  
  // pass light to fragment shader
  float light = diffuse + specular;
  vec3 color = vec3(0.7, 0.4, 0.5);
  if (sPosition.x > 0.0)
    if (light < 0.5)
      light = 0.4;
    else if (light <= 1.0)
      light = 0.9;
    else if (light >= 1.4)
      light = 1.4;
  gl_FragColor = vec4(color * light, 1);
  
}
