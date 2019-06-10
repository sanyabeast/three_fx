/**
 * @author alteredq / http://alteredqualia.com/
 */
import Pass from "three_fx/Pass"

import ConvolutionShader from "three_fx/shaders/ConvolutionShader"
import CopyShader from "three_fx/shaders/CopyShader"

class BloomPass extends Pass {
	static blurX = new THREE.Vector2( 1, 1 );
	static blurY = new THREE.Vector2( 1, 0.001953125 );

	constructor ( strength, kernelSize, sigma, resolution ) {
		super()

		strength = ( strength !== undefined ) ? strength : 1;
		kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
		sigma = ( sigma !== undefined ) ? sigma : 4.0;
		resolution = ( resolution !== undefined ) ? resolution : 256;

		this.enabled = true

		// render targets

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

		this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
		this.renderTargetX.texture.name = "BloomPass.x";
		this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );
		this.renderTargetY.texture.name = "BloomPass.y";

		// copy material

		if ( CopyShader === undefined )
			console.error( "BloomPass relies on CopyShader" );

		var copyShader = CopyShader;

		this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

		this.copyUniforms[ "opacity" ].value = strength;

		this.materialCopy = new THREE.ShaderMaterial( {

			uniforms: this.copyUniforms,
			vertexShader: copyShader.vertexShader,
			fragmentShader: copyShader.fragmentShader,
			blending: THREE.AdditiveBlending,
			transparent: true

		} );

		// convolution material

		if ( ConvolutionShader === undefined )
			console.error( "BloomPass relies on ConvolutionShader" );

		var convolutionShader = ConvolutionShader;

		this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

		this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurX;
		this.convolutionUniforms[ "cKernel" ].value = ConvolutionShader.buildKernel( sigma );

		this.materialConvolution = new THREE.ShaderMaterial( {

			uniforms: this.convolutionUniforms,
			vertexShader:  convolutionShader.vertexShader,
			fragmentShader: convolutionShader.fragmentShader,
			defines: {
				"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
				"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
			}

		} );

		this.needsSwap = false;

		this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
		this.scene  = new THREE.Scene();

		this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
		this.quad.frustumCulled = false; // Avoid getting clipped
		this.scene.add( this.quad );

	}

	render ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer.texture;
		this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurX;

		renderer.setRenderTarget( this.renderTargetX )
		renderer.clear( true )
		renderer.render( this.scene, this.camera );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX.texture;
		this.convolutionUniforms[ "uImageIncrement" ].value = BloomPass.blurY;

		renderer.setRenderTarget( this.renderTargetY )
		renderer.clear( true )
		renderer.render( this.scene, this.camera );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY.texture;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.setRenderTarget( readBuffer )
		renderer.clear( this.clear )
		renderer.render( this.scene, this.camera );

	}
}

export default BloomPass