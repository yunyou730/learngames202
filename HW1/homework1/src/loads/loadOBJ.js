
class ObjectLoader
{
	constructor(id,enableReceiveShadow)
	{
		var self = this;
		this._id = id
		this._manager = null;		
		this._loadedObj = null

		this._renderer = null
		this._mat = null
		this._transform = null

		this._enableReceiveShadow = enableReceiveShadow
		
		this._manager = new THREE.LoadingManager();
		this._manager.onProgress = function (item, loaded, total) {
			self.print("loadingManager.onProgress:" + item + "," + loaded + "/" + total);
			if(loaded >= total) 
			{
				self.onReady();
			}
		}

		this._manager.onError = function(err)
		{
			self.print("[err]" + err);
		}
	};


	print(content)
	{
		console.log("[ayy][" + this._id + "]" + content)
	}

	load(renderer,path,name,mat,transform)
	{
		this.print("load obj:" + path + ",name:" + name)

		this._renderer = renderer
		this._mat = mat
		this._transform = transform

		var self = this;
		new THREE.MTLLoader(this._manager).setPath(path).load(name + '.mtl', function (materials) {
			materials.preload();
			new THREE.OBJLoader(self._manager).setMaterials(materials).setPath(path).load(name + ".obj",
				function(object){
					self._loadedObj = object;
				})
		})		
	}

	onReady(){
		this.print("onReady")

		var renderer = this._renderer;
		var object = this._loadedObj;
		var objMaterial = this._mat;
		var transform = this._transform;
		var enableReceiveShadow = this._enableReceiveShadow;


		object.traverse(function (child) {
				if (child.isMesh) {
					let geo = child.geometry;
					let mat;
					if (Array.isArray(child.material)) mat = child.material[0];
					else mat = child.material;

					var indices = Array.from({ length: geo.attributes.position.count }, (v, k) => k);
					let mesh = new Mesh({ name: 'aVertexPosition', array: geo.attributes.position.array },
						{ name: 'aNormalPosition', array: geo.attributes.normal.array },
						{ name: 'aTextureCoord', array: geo.attributes.uv.array },
						indices, transform);

					let colorMap = new Texture();
					if (mat.map != null) {
						colorMap.CreateImageTexture(renderer.gl, mat.map.image);
					}
					else {
						colorMap.CreateConstantTexture(renderer.gl, mat.color.toArray());
					}

					let material = null;
					let shadowMaterial = null;

					let Translation = [transform.modelTransX, transform.modelTransY, transform.modelTransZ];
					let Scale = [transform.modelScaleX, transform.modelScaleY, transform.modelScaleZ];

					let light = renderer.lights[0].entity;
					switch (objMaterial) {
						case 'PhongMaterial':
							material = buildPhongMaterial(
								colorMap, 
								mat.specular.toArray(), 
								light, 
								Translation, 
								Scale, 
								"./src/shaders/phongShader/phongVertex.glsl", 
								"./src/shaders/phongShader/phongFragment.glsl",
								enableReceiveShadow
							);
							shadowMaterial = buildShadowMaterial(
								light, 
								Translation, 
								Scale, 
								"./src/shaders/shadowShader/shadowVertex.glsl", 
								"./src/shaders/shadowShader/shadowFragment.glsl");
							break;
						case 'ShadowMapTestMaterial':
							material = buildPhongMaterial(
									colorMap, 
									mat.specular.toArray(), 
									light, 
									Translation, 
									Scale, 
									"./src/shaders/phongShader/shadowMapTestVert.glsl", 
									"./src/shaders/phongShader/shadowMapTestFrag.glsl",
									enableReceiveShadow
								);
							break;
					}
					
					if(material != null)
					{
						material.then((data) => {
							let meshRender = new MeshRender(renderer.gl, mesh, data);
							renderer.addMeshRender(meshRender);
						});
					}
					
					if(shadowMaterial != null)
					{
						shadowMaterial.then((data) => {
							let shadowMeshRender = new MeshRender(renderer.gl, mesh, data);
							renderer.addShadowMeshRender(shadowMeshRender);
						});
					}
					
				}
			});
		}
}
