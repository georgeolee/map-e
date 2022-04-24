# map-e

A simple 2D vector map editor with a click-and-drag interface, built with React and p5js. It's a little tool I made to design particle emitter shapes for [a different little tool](https://github.com/georgeolee/p-widge).

### File Format

Vector maps are exported as PNG textures, with the red and green channels of each pixel corresponding to the X and Y components of a vector at that point. It's similar to the technique used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), but in 2D.

I've included a normal map mode as a throwaway bonus feature, but it doesn't attempt to fully add 3D support. Details on that [here](https://georgelee.space/map-e).

### Try It Out

You can find a working version (not necessarily the latest) [on my website](https://georgelee.space/map-e).\
The actual build, if you want to embed it somewhere or just cut back on clutter, is located [here](https://georgelee.space/build).
