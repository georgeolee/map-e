# map-e

Try it [here](https://map-e.netlify.app).

A simple visual editor for creating low-res 2D (or 2.5D) vector map textures. It's intended for use with programs that take texture data as an input, like shaders.

It's a tool I made to design emitter shapes for my [particle scratchpad](https://github.com/georgeolee/p-widge). There are tons of options out there for generating normal / bump maps from models or textures, but I just wanted to plonk arbitrary vectors down onto a blank canvas without any in-between steps or palette head scratching.

To use, just click and drag. Pixel color is calculated from your drag angle.

![edit-screencap-lossy](https://user-images.githubusercontent.com/62530485/185225449-22f8043e-6ae8-431c-894a-2683cdc51523.gif)
![emitter-lossy](https://user-images.githubusercontent.com/62530485/185469727-cd0df09c-f406-43b4-8be2-732b93360939.gif)\
*creating a particle emission map*


### Notes

All vectors are unit vectors and EITHER
- have a Z component of 1 (empty grid cells) OR
- have a Z component of 0 (non-empty grid cells)


The XYZ to RGB encoding scheme follows the convention used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), with a couple differences:

- Y+ axis points down instead of up
- "empty" pixels have an alpha channel of zero

There is an actual normal map mode, but it's mostly just for kicks. It might work for an 8-bit game with stylized lighting; anything more complex would be super tedious.

![nmap](https://user-images.githubusercontent.com/62530485/187300672-d31bb07e-72df-41ee-b1e7-24c6509d325c.png)
![nmap-lossy](https://user-images.githubusercontent.com/62530485/187298979-99760a5d-335e-4684-aba7-793372b64637.gif)\
*making fake brick details in normal map mode*


