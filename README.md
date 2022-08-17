# map-e

A simple editor for creating vector maps that can be used by shaders or other programs that take texture data as an input.

It's a tool I made to design emitter shapes for my [particle scratchpad](https://github.com/georgeolee/p-widge).

![edit-screencap-lossy](https://user-images.githubusercontent.com/62530485/185225449-22f8043e-6ae8-431c-894a-2683cdc51523.gif)


### Encoding

Vector maps are exported as PNG textures. The red and green channels of each pixel map to the X and Y components of a unit vector at that point – similar to the technique used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), but in 2D. Empty points are represented with transparent pixels.


### Try It Out

You can find a working build [here](https://map-e.netlify.app).

