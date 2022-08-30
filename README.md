# map-e

Try it [here](https://map-e.netlify.app).

A simple visual editor for creating low res 2D (or 2.5D) vector map textures. It allows you to map out an arbitrary set of vectors by hand, as opposed to generating them from another texture or model, while handling all the color calculations for you.

Vector maps are exported as ordinary PNG files, which can be interpreted by a shader or other program capable of reading texture data. I use them in my [particle scratchpad](https://github.com/georgeolee/p-widge) to define emission points.

To start editing, just click and drag in any grid cell. The vector at that position will rotate towards your cursor or finger, and the corresponding pixel will have its color adjusted accordingly.

![edit-screencap-lossy](https://user-images.githubusercontent.com/62530485/185225449-22f8043e-6ae8-431c-894a-2683cdc51523.gif)
![emitter-lossy](https://user-images.githubusercontent.com/62530485/185469727-cd0df09c-f406-43b4-8be2-732b93360939.gif)\
*creating and using a vector map*


### Notes

All vectors are unit vectors. For empty grid cells, the Z component is 1. For all others, Z is 0.

The XYZ to RGB encoding scheme follows the convention used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), with a couple differences:
- Y+ axis points down instead of up
- empty pixels have an alpha channel of zero (but they still use the standard 128/128/255 for RGB)

There's also an actual normal map mode. It's not made with heavy use in mind, but it might suffice if you want to add lighting details to an 8-bit sprite or a simple wall texture. Anything more complex is probably better handled with an automated tool.

![nmap](https://user-images.githubusercontent.com/62530485/187300672-d31bb07e-72df-41ee-b1e7-24c6509d325c.png)
![nmap-lossy](https://user-images.githubusercontent.com/62530485/187298979-99760a5d-335e-4684-aba7-793372b64637.gif)\
*using normal map mode to create a fake texture on a smooth surface*
