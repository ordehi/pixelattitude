## Undo / Redo

Undo needs some sort of memory storage that we can revert to
It needs to store the state of the grid up to some extent

We could store it against localStorage?

what would be the data structure?

What do I need to store actually?

The cell positions and color data, the cells are numbered so I can store the cell number with their color data

The memory store behind and beyond the current time, so there are two memory stores.

The behind store stores actions done before so that they can be undone, the beyond store does so with actions that were undone, so they can be redone/reverted

How does that data structure look like?

An object?

const undoStore = {

}

Actually an array of objects, since an array is indexed from oldest to newest we can simply use push and pop to undo/redo

const undoStore = [
{
cell: "cell-1".
color: "#FFF",
},
]

So we'll access memory like this

let undo = undoStore.pop()

app.querySelector(undo.cell).style.color = undo.color

redo can work much the same, but triggers when undo is used.

const redoStore = []

redoStore.push(undo)

## Saving a screenshot

[HackerNoon's article on this](https://hackernoon.com/how-to-take-screenshots-in-the-browser-using-javascript-l92k3xq7)

It suggests three approaches:

**Using html2canvas**
Send the DOM to a canvas context and takes the screenshot from the canvas.

It's sort of the standard for many applications since it was proven scalabable by discovering Google uses a similar method.

Requires third-party code.

**Using getDisplayMedia from the WebRTC API**

Similar to html2canvas, this gets the DOM and puts it through a video and canvas elements to mock a stream and take a screenshot from it.

It requires the user to give permission for streaming which can be confusing and frictiony.

Scales well to video capture.

This is native to browsers so no need for third-party code.

**Using Screenshots as a Service**

This is pretty obvious, I'm not considering it for this project, not only due to costs involved but also because I want to use as few third-party libraries/services as possible.
