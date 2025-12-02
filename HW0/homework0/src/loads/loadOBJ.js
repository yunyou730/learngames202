
var _loadedObj = null;
var _renderer = null;

function loadOBJ(renderer, path, name) 
{	
	_renderer = renderer;
	const manager = new THREE.LoadingManager();
	manager.onProgress = function (item, loaded, total) {
		console.log("[ayy]",item, loaded, total);
		if(loaded >= total)
		{
			onLoadedAll();
		}
	};

	new THREE.MTLLoader(manager).setPath(path).load(name + '.mtl',function(materials){
		console.log("[ayy] mtl load done");
		materials.preload();
		new THREE.OBJLoader(manager).setMaterials(materials).setPath(path).load(name + '.obj',function(object){
			console.log("[ayy] obj load done");
			_loadedObj = object;
		})
	})
}

function onLoadedAll()
{
	console.log("[ayy] onLoadedAll:" + _loadedObj)
	_loadedObj.traverse(function (child) {
		console.log("[ayy][type]" + child.type + " [name]" + child.name);

		if (child.isMesh) {
			let geo = child.geometry;
			let mat;
			if (Array.isArray(child.material)) 
				mat = child.material[0];
			else 
				mat = child.material;

			var indices = Array.from({ length: geo.attributes.position.count }, (v, k) => k);
			let mesh = new Mesh({ name: 'aVertexPosition', array: geo.attributes.position.array },
				{ name: 'aNormalPosition', array: geo.attributes.normal.array },
				{ name: 'aTextureCoord', array: geo.attributes.uv.array },
				indices);

			let colorMap = null;

			if(mat != null && mat.map != null)
			{
				console.log("[ayy]mat.map.image:" + mat.map.image);
				if(mat.map.image == undefined || mat.map.image == null)
				{
					console.log("[ayy]mat.map.image not ready s2");
				}
			}
			else
			{
				console.log("[ayy]mat.map.image not ready,s1");
			}

			if (mat.map != null) 
			{
				colorMap = new Texture(_renderer.gl, mat.map.image);
			}
				
			// MARK: You can change the myMaterial object to your own Material instance

			let textureSample = 0;
			let myMaterial;
			if (colorMap != null) {
				textureSample = 1;
				myMaterial = new Material({
					'uSampler': { type: 'texture', value: colorMap },
					'uTextureSample': { type: '1i', value: textureSample },
					'uKd': { type: '3fv', value: mat.color.toArray() }
				},[],VertexShader, FragmentShader);
			}else{
				myMaterial = new Material({
					'uTextureSample': { type: '1i', value: textureSample },
					'uKd': { type: '3fv', value: mat.color.toArray() }
				},[],VertexShader, FragmentShader);
			}
			
			
			let meshRender = new MeshRender(_renderer.gl, mesh, myMaterial);
			_renderer.addMesh(meshRender);
		}



	})

}
