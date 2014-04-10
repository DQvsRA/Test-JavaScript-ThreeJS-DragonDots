(function () {
	
	var SCALE = 50;

	var _stats;
	var _camera, _controls, _lightDirectional, _lightAmbient, _scene, _renderer;
    var _manager, _loader, _geometry, _materialMesh, _materialVertex, _mesh, _vertexColor;

    // GRID SETTINGS
    var _gridFloor 			= 0, 
    	_gridStep 			= 100, 
    	_gridResolution 	= 12, 
    	_gridOffset 		= _gridResolution * _gridStep * 0.5;

    // RANDOM SHPERE SETTINGS	
    var _randomShpereCounter 		= 10,
		_randomShpereSize 			= 10,
		_randomShpereDivisions 		= 8,
		_randomShpereMaterialParams = {
			ambient 	: 0xffcc00,
			color 		: 0xFFcc00, 
			specular 	: 0x555555, 
			shininess 	: 30 
		};

    Init();
	Animate();

	window.addEventListener( 'resize', Handle_WindowResize, false );

    function Init() {
       	
       	/* INITIALIZE */
       	Initialize();
		/* CREATE GRID */
		Create_Grid();
		/* CREATE RANDOM SPHERES */
		Create_RandomShperes();
		/* LOAD AND CREATE OBJECTS FROM FILE */
		Create_LoadObjects();

		Setup_Renderer();
		Setup_Camera();
		Setup_Lights();
		Setup_Stats();
	}

    function Animate() {
        requestAnimationFrame( Animate );
       	_renderer.render( _scene, _camera );
        _stats.update();
        _controls.update();
    }

	function Handle_WindowResize (event) {
		_camera.aspect = window.innerWidth / window.innerHeight;
		_camera.updateProjectionMatrix();

		_renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function Setup_Stats () {
		_stats = new Stats();
		_stats.domElement.style.position = 'absolute';
		_stats.domElement.style.top = '0px';
		_stats.domElement.style.zIndex = 100;
		document.body.appendChild( _stats.domElement );
	}

	function Setup_Lights () {
		_lightDirectional.position.set( 1, 1, 0 ).normalize();
		_scene.add( _lightDirectional );
		_scene.add( _lightAmbient );
	}

	function Setup_Camera () {
		_camera.position.x = 1500;
		_camera.position.y = 500;
		_camera.position.z = 1500;
	}

	function Setup_Renderer () {
		/* SOME OTHER RENDRERS */
        _renderer = new THREE.WebGLRenderer( { antialias: true } );
		_renderer.setClearColor( 0x2222222, 1 );
        _renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( _renderer.domElement );
	}

	function Create_LoadObjects () {
		_loader.load("dragon_lowpoly.js", function (_geometry) {
			var i, j, k;
			for ( i = 0, j = _geometry.faces.length; i < j; i ++ ) {
				_geometry.faces[ i ].color.setHex( Math.random() * 0xffffff ); // same _geometry.faces[ i ].color.setRGB( Math.random(), Math.random(), Math.random() );
			}

			var sphere_geom, vertex, sphere_mesh;
			for ( k = _geometry.vertices.length - 1; k >= 0; k-- ) {
				vertex = _geometry.vertices[k];
				sphere_geom = new THREE.SphereGeometry( 0.035, 6, 6 );
				for ( i = 0, j = sphere_geom.faces.length; i < j; i ++ ) { 
					sphere_geom.faces[ i ].color.setHex( _vertexColor ); 
				}
				sphere_mesh = new THREE.Mesh(sphere_geom, _materialVertex);
				sphere_mesh.position.x = vertex.x;
				sphere_mesh.position.y = vertex.y;
				sphere_mesh.position.z = vertex.z;
				THREE.GeometryUtils.merge(_geometry, sphere_mesh);
			};
			_mesh = new THREE.Mesh(_geometry, _materialMesh);
			_mesh.scale.x = _mesh.scale.y = _mesh.scale.z = SCALE;
			_scene.add( _mesh );
		})
	}

	function Create_RandomShperes () {
		var counter = _randomShpereCounter;
		var sphere_geom, vertex, sphere_mesh;
		var cubelimits = _gridOffset * 2;
		while(counter--) {
			sphere_geom = new THREE.SphereGeometry( _randomShpereSize, _randomShpereDivisions, _randomShpereDivisions );
			sphere_mesh = new THREE.Mesh( sphere_geom, new THREE.MeshPhongMaterial( _randomShpereMaterialParams ) );
			sphere_mesh.position.set( ( Math.random() - 0.5 ) * cubelimits, ( Math.random() - 0.5 ) * cubelimits, ( Math.random() - 0.5 ) * cubelimits );
			_scene.add( sphere_mesh );
		}
	}

	function Create_Grid () {
		var grig_material 	= new THREE.LineBasicMaterial( { color: 0x303030 } ),
			grig_geomentry  = new THREE.Geometry(),
			_gridFloor = 0, _gridStep = 100, _gridResolution = 12, _gridOffset = _gridResolution*_gridStep*0.5;

		for ( var i = 0; i <= _gridResolution; i ++ ) {
			grig_geomentry.vertices.push( new THREE.Vector3( - _gridOffset, _gridFloor, i * _gridStep - _gridOffset ) );
			grig_geomentry.vertices.push( new THREE.Vector3(   _gridOffset, _gridFloor, i * _gridStep - _gridOffset ) );

			grig_geomentry.vertices.push( new THREE.Vector3( i * _gridStep - _gridOffset, _gridFloor, -_gridOffset ) );
			grig_geomentry.vertices.push( new THREE.Vector3( i * _gridStep - _gridOffset, _gridFloor,  _gridOffset ) );
		}

		var line = new THREE.Line( grig_geomentry, grig_material, THREE.LinePieces );
		_scene.add( line );
	}

	function Initialize() {
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;

        _camera 			= new THREE.PerspectiveCamera( 40, windowHalfX / windowHalfY, 1, 10000 );
        _scene 				= new THREE.Scene();
       	_controls 			= new THREE.TrackballControls( _camera );

		_materialMesh 		= new THREE.MeshBasicMaterial( { color: 0xffFFff, wireframe: true, vertexColors: THREE.FaceColors } );
       	_materialVertex 	= new THREE.MeshBasicMaterial( { color: 0x00ff00, vertexColors: THREE.FaceColors } );
       	_vertexColor			= 0xeeeeee;

        _manager 			= new THREE.LoadingManager();
        _loader 			= new THREE.JSONLoader( _manager );

        _lightDirectional 	= new THREE.DirectionalLight( 0xffffff );
        _lightAmbient 		= new THREE.AmbientLight( 0xFFFFFF );

        /* SOME OTHER TEST MATERIALS */
        // _materialMesh 	= new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } );
        // _materialMesh 	= new THREE.MeshBasicMaterial( { color: 0xff00ff, vertexColors: THREE.FaceColors } );
       	// _materialVertex 	= new THREE.MeshPhongMaterial( { _lightAmbient: 0x050505, color: 0x000000, specular: 0x555555, shininess: 30 } );
       	// _materialVertex 	= new THREE.LineBasicMaterial( { color: 0x303030 } ),
       	// _materialVertex 	= new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	}

})();