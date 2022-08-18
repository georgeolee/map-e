# map-e

Try it [here](https://map-e.netlify.app).

A simple WYSIWYG editor for creating low-res 2D (or 2.5D) vector map textures. It exports to PNG for use with shaders or other programs that take texture data as an input.

It's a tool I made to design emitter shapes for my [particle scratchpad](https://github.com/georgeolee/p-widge). There are tons of options out there for generating normal / bump maps from models or textures, but I just wanted to plonk arbitrary vectors down onto a blank canvas without any in-between steps or palette head scratching.

To use, just click and drag. Pixel color is calculated from your drag angle.

![edit-screencap-lossy](https://user-images.githubusercontent.com/62530485/185225449-22f8043e-6ae8-431c-894a-2683cdc51523.gif)\
*creating a map in the editor*

![emitter-lossy](https://user-images.githubusercontent.com/62530485/185469727-cd0df09c-f406-43b4-8be2-732b93360939.gif)\
*using the exported vector map*

### Notes

The XYZ to RGB encoding scheme follows the convention used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), for the most part. Outside of normal map mode, there are a couple differences:

- Y+ axis points down instead of up
- "empty" pixels have an alpha channel of zero

All vectors are unit vectors, and all empty pixels point along the Z axis. Any vector placed in the editor lies in the XY plane.

