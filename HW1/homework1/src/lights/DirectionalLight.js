class DirectionalLight {

    constructor(lightIntensity, lightColor, lightPos, focalPoint, lightUp, hasShadowMap, gl) {
        this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
        this.mat = new EmissiveMaterial(lightIntensity, lightColor);
        this.lightPos = lightPos;
        this.focalPoint = focalPoint;
        this.lightUp = lightUp

        this.hasShadowMap = hasShadowMap;
        this.fbo = new FBO(gl);
        if (!this.fbo) {
            console.error("无法设置帧缓冲区对象");
            return;
        }
    }

    CalcLightMVP(translate, scale) {
        let lightMVP = mat4.create();
        let modelMatrix = mat4.create();
        let viewMatrix = mat4.create();
        let projectionMatrix = mat4.create();

        // Model transform
        mat4.translate(modelMatrix,modelMatrix,translate);
        mat4.scale(modelMatrix,modelMatrix,scale);
    
        // View transform
        mat4.lookAt(viewMatrix,this.lightPos,this.focalPoint,this.lightUp);
    
        // Projection transform
        // var r = 100;  
        // var l = -r;  
        // var t = 100;  
        // var b = -t;  
        // var n = 0.01;  
        // var f = 200;  
        // mat4.ortho(projectionMatrix, l, r, b, t, n, f);              
        mat4.ortho(projectionMatrix,-100,100,-100,100,0.1,400.0); // shadowmap 的形状是正方形, 这里也简化 ortho 的范围 widht,height 都一样

        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);

        return lightMVP;
    }
}
