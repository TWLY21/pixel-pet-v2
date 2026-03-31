export function createDragSystem({ petLayer, onDragStart, onDragMove, onDragEnd, setPointerCapture }) {
  let dragState = null;

  function bindPetButtons() {
    for (const button of document.querySelectorAll(".pet-hitbox")) {
      button.addEventListener("mousedown", async (event) => {
        const shell = button.closest(".pet-shell");
        const shellRect = shell.getBoundingClientRect();

        dragState = {
          petId: button.dataset.petId,
          offsetX: event.clientX - shellRect.left
        };

        setPointerCapture(true);
        await onDragStart(dragState.petId);
        event.preventDefault();
      });
    }
  }

  window.addEventListener("mousemove", async (event) => {
    if (!dragState) {
      return;
    }

    const layerRect = petLayer.getBoundingClientRect();
    const nextX = event.clientX - layerRect.left - dragState.offsetX;
    await onDragMove({
      petId: dragState.petId,
      x: nextX
    });
  });

  window.addEventListener("mouseup", async () => {
    if (!dragState) {
      return;
    }

    const petId = dragState.petId;
    dragState = null;
    await onDragEnd(petId);
    setPointerCapture(false);
  });

  return {
    bindPetButtons
  };
}
