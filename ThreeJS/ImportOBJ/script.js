(function () {
	
	// uglifyjs OBJLoader.js -o OBJLoader.min.js -p 5 -c -m
	// uglifyjs MTLLoader.js -o MTLLoader.min.js -p 5 -c -m
	// uglifyjs OBJMTLLoader.js -o OBJMTLLoader.min.js -p 5 -c -m
	// uglifyjs WebGLRenderer3.js -o WebGLRenderer3.min.js -p 5 -c -m
	// uglifyjs TrackballControls.js -o TrackballControls.min.js -p 5 -c -m
	// uglifyjs SoftwareRenderer.js -o SoftwareRenderer.min.js -p 5 -c -m

	// python convert_obj_three.py -i dragon_lowpoly.obj -o dragon_lowpoly.js
	// convert_to_threejs.py dragon_lowpoly_fbx.fbx dragon_lowpoly_fbxjs -g -l
	var SCALE = 50;

	var stats;
	var mouseX = 0, mouseY = 0;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var camera, directionalLight, ambient, scene, renderer;
    var manager, loader, geometry, material, mesh;

    init();
	animate();

	window.addEventListener( 'resize', Handle_WindowResize, false );

    function init() {

        camera 		= new THREE.PerspectiveCamera( 40, windowHalfX / windowHalfY, 1, 10000 );
        scene 		= new THREE.Scene();
       	controls 	= new THREE.TrackballControls( camera );
        
        // material 	= new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } );
        // material 	= new THREE.MeshBasicMaterial( { color: 0xff00ff, vertexColors: THREE.FaceColors } );
       	material 	= new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true, vertexColors: THREE.FaceColors } );
       	// material2 	= new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x000000, specular: 0x555555, shininess: 30 } );
       	// material2 	= new THREE.LineBasicMaterial( { color: 0x303030 } ),
       	// material2 	= new THREE.MeshBasicMaterial({color: 0x00ff00 });
       	material2 	= new THREE.MeshBasicMaterial( { color: 0x00ff00, vertexColors: THREE.FaceColors } );
       	staticolor	= 0x212121;//Math.random() * 0xFFFFFF;

        manager 	= new THREE.LoadingManager();
        // loader 		= new THREE.OBJMTLLoader( manager );
        loader 		= new THREE.JSONLoader( manager );

        directionalLight = new THREE.DirectionalLight( 0xffffff );
        ambient 	= new THREE.AmbientLight( 0xFFFFFF );
		
		// Grid
		var grig_material 	= new THREE.LineBasicMaterial( { color: 0x303030 } ),
			grig_geomentry  = new THREE.Geometry(),
			floor = 0, step = 100, grids = 12, grid_offset = grids*step*0.5;

		for ( var i = 0; i <= grids; i ++ ) {
			grig_geomentry.vertices.push( new THREE.Vector3( - grid_offset, floor, i * step - grid_offset ) );
			grig_geomentry.vertices.push( new THREE.Vector3(   grid_offset, floor, i * step - grid_offset ) );

			grig_geomentry.vertices.push( new THREE.Vector3( i * step - grid_offset, floor, -grid_offset ) );
			grig_geomentry.vertices.push( new THREE.Vector3( i * step - grid_offset, floor,  grid_offset ) );
		}

		var line = new THREE.Line( grig_geomentry, grig_material, THREE.LinePieces );
		scene.add( line );

		// loader.load( 'dragon_lowpoly_withmat.obj', 'dragon_lowpoly_withmat.mtl', Handle_LoaderComplete);
		
		var phys_sphere_counter = 10;
		var counter = phys_sphere_counter;
		var sphere_size = 10;
		var sphere_div = 8;
		var sphere_geom, vertex, sphere_mesh;
		var matparam = { ambient: 0x050505, color: 0x000000, specular: 0x555555, shininess: 30 };
		var cubelimits = grid_offset * 2;
		while(counter--) {
			sphere_geom = new THREE.SphereGeometry( sphere_size, sphere_div, sphere_div );
			sphere_mesh = new THREE.Mesh( sphere_geom, new THREE.MeshPhongMaterial( matparam ) );
			sphere_mesh.position.set( ( Math.random() - 0.5 ) * cubelimits, ( Math.random() - 0.5 ) * cubelimits, ( Math.random() - 0.5 ) * cubelimits );
			console.log(sphere_mesh.position);
			scene.add( sphere_mesh );
		}


		loader.load("dragon_lowpoly.js", function (geometry) {
			var i, j, k;
			for ( i = 0, j = geometry.faces.length; i < j; i ++ ) {
				// geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
				geometry.faces[ i ].color.setRGB( Math.random(), Math.random(), Math.random() );
			}

			for ( k = geometry.vertices.length - 1; k >= 0; k-- ) {
				vertex = geometry.vertices[k];
				sphere_geom = new THREE.SphereGeometry( 0.075, 6, 6 );
				for ( i = 0, j = sphere_geom.faces.length; i < j; i ++ ) {
					sphere_geom.faces[ i ].color.setHex( staticolor );
				}
				sphere_mesh = new THREE.Mesh(sphere_geom, material2);
				sphere_mesh.position.x = vertex.x;
				sphere_mesh.position.y = vertex.y;
				sphere_mesh.position.z = vertex.z;
				// sphere.scale.x = sphere.scale.y = sphere.scale.z = SCALE;
				THREE.GeometryUtils.merge(geometry, sphere_mesh);
			};
			mesh = new THREE.Mesh(geometry, material);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = SCALE;
			scene.add( mesh );
		})

		// 
		// directionalLight.position.set( 1, 1, 0 ).normalize();
		camera.position.z = 1500;
		camera.position.y = 500;
		camera.position.x = 1500;

		 // scene.add( directionalLight );
		 // scene.add( ambient );

        // renderer = new THREE.CanvasRenderer();
        renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xffffff, 1 );
		// renderer = new THREE.SoftwareRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        
        stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;

		document.body.appendChild( stats.domElement );
		document.body.appendChild( renderer.domElement );
	}

    function animate() {
        requestAnimationFrame( animate );
       	renderer.render( scene, camera );
        stats.update();
        controls.update();
    }

    function Handle_LoaderComplete (object) {
    	mesh = object; //new THREE.Mesh(object);
    	geometry = mesh.geometry
    	console.log(mesh, geometry);
		// mesh.traverse( function ( child ) {
		// 	if ( child instanceof THREE.Object3D  ) {
		// 		// geometry = child.geometry
		// 		// for ( var i = 0, j = geometry.faces.length; i < j; i ++ ) geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );
		// 		// child.material = material;
		// 		 child.material.color.setRGB (1, 1, 0);
		// 		return;
		// 	}
		// } );
		
		scene.add( mesh );
    }

	function Handle_WindowResize (event) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

})();