/**
 * @author alteredq / http://alteredqualia.com/
 */



import Pass from "three_fx/Pass"
import FilmShader from "three_fx/shaders/FilmShader"


class FilmPass extends Pass {
	constructor( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

		super()

		if ( FilmShader === undefined )
			console.error( "THREE.FilmPass relies on THREE.FilmShader" );

		var shader = FilmShader;

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
		if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
		if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
		if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene  = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

	}

	render ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "time" ].value += deltaTime;

		this.quad.material = this.material;

		if ( this.renderToScreen ) {
			renderer.clear( null )
			renderer.setRenderTarget( null )
			renderer.render( this.scene, this.camera );

		} else {
			renderer.clear( this.clear )
			renderer.setRenderTarget( writeBuffer )
			renderer.render( this.scene, this.camera );

		}

	}


}

export default FilmPass
