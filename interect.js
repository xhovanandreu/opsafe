<script>
        document.getElementById('reset-btn').addEventListener('click', function() {
            $('.containerD').html(" ");
        });
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('send-btn').addEventListener('click', function() {
                var dropContainer = document.querySelector('.containerD');
                var formId = dropContainer.getAttribute('data-form-id');
                var items = Array.from(dropContainer.children);
                var data = items.map(function(item) {
                    return {
                        'src': item.src,
                        'data_x': item.getAttribute('data-x') || '0',
                        'data_y': item.getAttribute('data-y') || '0',
                        'data_angle': item.getAttribute('data-angle') || '0',
                        'data_width': item.style.width || '0',
                        'data_height': item.style.height || '0',
                        'form_id': formId
                    };
                });
                var json = JSON.stringify(data);
                if (!navigator.onLine) {
                    Swal.fire({
                        icon: 'info',
                        title: 'No internet connection',
                        text: 'The form will be sent automatically once you have an internet connection.'
                    });
                    saveFormDataLocally(json); // Save form data locally
                    return;
                }
                sendFormData(json);
            });
        });
        document.addEventListener('DOMContentLoaded', function() {
            var storedData = localStorage.getItem('formData');
            if (storedData) {
                sendFormData(storedData);
            }
            window.addEventListener('online', function() {
                var storedData = localStorage.getItem('formData');
                if (storedData) {
                    sendFormData(storedData);
                }
            });
        });
        function sendFormData(json) {
            fetch('/upload/store', {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    method: 'POST',
                    body: json
                })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(function(data) {
                    Swal.fire({
                        icon: 'uccess',
                        title: 'Visual sent successfully',
                        showConfirmButton: true,
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#3085d6'
                    }).then(function(result) {
                        if (result.isConfirmed) {
                            // Delay the redirection to allow time for the Swal alert to be displayed
                            // setTimeout(function() {
                            //     window.location.href = '/visual/show';
                            // }, 1000); // Adjust the delay time as needed
                        }
                    });
                    localStorage.removeItem('formData');
                })
                .catch(function(error) {
                    if (error instanceof TypeError) {
                        Swal.fire({
                            icon: 'info',
                            title: 'No internet connection',
                            text: 'The form will be sent automatically once you have an internet connection.'
                        });
                        // Save form data locally
                        saveFormDataLocally(json);
                        // Check if there is stored form data and send it again after a short delay
                        var storedData = localStorage.getItem('formData');
                        if (storedData) {
                            setTimeout(function() {
                                sendFormData(storedData);
                            }, 5000); // Adjust the delay time as needed
                        }
                    } else {
                        console.error('Error:', error);
                    }
                });
        }
        // Function to save form data locally
        function saveFormDataLocally(formData) {
            localStorage.setItem('formData', formData);
        }
        document.addEventListener('DOMContentLoaded', function() {
            var container = document.querySelector('.containerD');
            // var dropContainer = document.querySelector('.drop-container');
            var dragItems = document.querySelectorAll('.drag-item');
            var angleScale = {
                angle: 0,
                scale: 1
            };
            var gestureArea = document.getElementById('gesture-area');
            var scaleElement = document.getElementById('scale-element');
            var resetTimeout;
            dragItems.forEach(function(dragItem) {
                dragItem.addEventListener('mousedown', function(event) {
                    var target = event.target;
                    if (target.getAttribute('data-cloneable') === 'true') {
                        var clone = target.cloneNode(true);
                        clone.removeAttribute('data-cloneable');
                        clone.classList.remove('drag-item');
                        clone.classList.add('clone');
                        clone.style.position = 'absolute';
                        // Position the clone at a random location within the container
                        var x = Math.random() * (container.offsetWidth - clone.offsetWidth);
                        var y = Math.random() * (container.offsetHeight - clone.offsetHeight);
                        clone.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                        clone.setAttribute('data-x', x);
                        clone.setAttribute('data-y', y);
                        container.appendChild(clone);
                        // Add interactions to clone
                        addInteractions(clone);
                        clone.addEventListener('dblclick', function(e) {
                            e.target.remove();
                        });
                    }
                });
            });
            function addInteractions(clone) {
                interact(clone)
                    .draggable({
                        inertia: true,
                        modifiers: [
                            interact.modifiers.restrictRect({
                                restriction: '.containerD',
                                endOnly: true
                            })
                        ],
                        autoScroll: true,
                        onstart: dragStartListener,
                        onmove: function(event) {
                            var target = event.target;
                            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                            var scale = target.getAttribute('data-scale') || 1;
                            var angle = target.getAttribute('data-angle') || 0;
                            target.style.transform = 'translate(' + x + 'px, ' + y +
                                'px) rotate(' + angle + 'deg) scale(' + scale + ')';
                            target.setAttribute('data-x', x);
                            target.setAttribute('data-y', y);
                        },
                        onend: dragEndListener
                    })
                    .resizable({
                        edges: {
                            left: true,
                            right: true,
                            bottom: true,
                            top: true
                        },
                        listeners: {
                            move: resizeListener
                        }
                    })
                    .gesturable({
                        onstart: function(event) {
                            var target = event.target;
                            var angle = parseFloat(target.getAttribute('data-angle')) || 0;
                            target.style.transform = 'rotate(' + angle + 'deg)';
                        },
                        onmove: function(event) {
                            var target = event.target;
                            var angle = parseFloat(target.getAttribute('data-angle')) || 0;
                            var x = target.getAttribute('data-x') || 0;
                            var y = target.getAttribute('data-y') || 0;
                            angle += event.da;
                            target.style.transform = 'translate(' + x + 'px, ' + y +
                                'px) rotate(' + angle + 'deg)';
                            target.setAttribute('data-angle', angle);
                        },
                        onend: function(event) {
                            var target = event.target;
                            target.setAttribute('data-angle', target.getAttribute('data-angle'));
                        }
                    });
            }
            function dragStartListener(event) {
                var target = event.target;
                if (target.getAttribute('data-cloneable') === 'true' && target.parentNode.className !==
                    'container') {
                    var clone = target.cloneNode(true);
                    clone.classList.remove('drag-item');
                    clone.classList.add('clone');
                    clone.style.position = 'absolute';
                    // Position the clone at a random location within the container
                    var x = Math.random() * (container.offsetWidth - clone.offsetWidth);
                    var y = Math.random() * (container.offsetHeight - clone.offsetHeight);
                    clone.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                    clone.setAttribute('data-x', x);
                    clone.setAttribute('data-y', y);
                    container.appendChild(clone);
                    interact(clone) // target the clone
                        .draggable({
                            inertia: true,
                            modifiers: [
                                interact.modifiers.restrictRect({
                                    restriction: '.containerD',
                                    endOnly: true
                                })
                            ],
                            autoScroll: true,
                            onstart: dragStartListener,
                            onmove: dragMoveListener,
                            onend: dragEndListener
                        })
                        .resizable({
                            edges: {
                                left: true,
                                right: true,
                                bottom: true,
                                top: true
                            },
                            listeners: {
                                move: resizeListener
                            }
                        })
                        .gesturable({
                            onmove: gestureListener
                        });
                }
                target.classList.add('dragging');
            }
            function dragMoveListener(event) {
                var target = event.target;
                var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
            function dragEndListener(event) {
                var target = event.target;
                target.classList.remove('dragging');
            }
            function resizeListener(event) {
                var target = event.target;
                var x = parseFloat(target.getAttribute('data-x')) || 0;
                var y = parseFloat(target.getAttribute('data-y')) || 0;
                target.style.width = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';
                x += event.deltaRect.left;
                y += event.deltaRect.top;
                target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
            function gestureListener(event) {
                var target = event.target;
                var rotation = parseFloat(target.getAttribute('data-rotation')) || 0;
                rotation += event.rotation;
                target.style.transform = 'translate(' + target.getAttribute('data-x') + 'px, ' + target
                    .getAttribute('data-y') + 'px) rotate(' + rotation + 'deg)';
                target.setAttribute('data-rotation', rotation);
            }
            function dragEnterListener(event) {
                var target = event.target;
                target.classList.add('drag-enter');
            }
            function dragLeaveListener(event) {
                var target = event.target;
                target.classList.remove('drag-enter');
            }
            function dropListener(event) {
                var target = event.target;
                var draggableElement = event.relatedTarget;
                target.classList.remove('drag-enter');
                draggableElement.classList.remove('dragging');
                target.appendChild(draggableElement);
            }
        });
    </script>