# map-e

A simple 2D vector map editor with a click-and-drag interface. It's a tool I made to design emitter shapes for my [particle scratchpad](https://github.com/georgeolee/p-widge).

### File Format

Vector maps are exported as PNG textures. The red and green channels of each pixel map to the X and Y components of a unit vector at that point – similar to the technique used by [normal maps](https://en.wikipedia.org/wiki/Normal_mapping), but in 2D. Empty points are represented with transparent pixels.


### Try It Out

You can find a working build [here](https://map-e.netlify.app).

