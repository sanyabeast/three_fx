/**
 * @author alteredq / http://alteredqualia.com/
 */


import Pass from "three_fx/Pass"
import DotScreenShader from "three_fx/shaders/DotScreenShader"

class DotScreenPass extends Pass {
	constructor( center, angle, scale ) {
		super()

		if ( DotScreenShader === undefined )
			console.error( "THREE.DotScreenPass relies on DotScreenShader" );

		var shader = DotScreenShader;

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
		if ( angle !== undefined ) this.uniforms[ "angle" ].value = angle;
		if ( scale !== undefined ) this.uniforms[ "scale" ].value = scale;

		this.material = new THREE.ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene  = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

	}

	render ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		this.uniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

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

export default DotScreenPass