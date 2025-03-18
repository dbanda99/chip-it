document.addEventListener("DOMContentLoaded", function () {
  console.log("Contact page loaded.");

  const form = document.querySelector(".needs-validation");
  const phoneInput = document.getElementById("phone");
  const confirmBtn = document.getElementById("confirmBtn");

  // Format the phone input as the user types
  phoneInput.addEventListener("input", formatPhone);

  function formatPhone(e) {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 10) {
      input = input.slice(0, 10);
    }
    let formatted = "";
    if (input.length > 0) {
      formatted = "(" + input.substring(0, 3);
    }
    if (input.length >= 4) {
      formatted += ") - " + input.substring(3, 6);
    }
    if (input.length >= 7) {
      formatted += " - " + input.substring(6, 10);
    }
    e.target.value = formatted;
  }

  // Show/hide loading overlay
  function showLoadingOverlay() {
    let overlay = document.getElementById("loadingOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loadingOverlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "9999";
      overlay.style.color = "#fff";
      overlay.style.fontSize = "1.5rem";
      overlay.style.backdropFilter = "blur(3px)";
      overlay.innerText = "Submitting, please wait...";
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = "flex";
    }
  }

  function hideLoadingOverlay() {
    let overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  // Endpoint URL for your Node.js server
  const endpointUrl =
    "https://server-chipit.onrender.com/send-email"; // Update to your actual server endpoint

  // When the user clicks "Confirm" in the modal, redirect to services.html
  confirmBtn.addEventListener("click", () => {
    window.location.href = "services.html";
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    let valid = true;
    const nameRegex = /^[A-Za-z\s'-]+$/;

    // Validate First Name
    const firstNameField = document.getElementById("firstName");
    const firstName = firstNameField.value;
    if (!nameRegex.test(firstName)) {
      firstNameField.setCustomValidity("Please use letters only.");
      valid = false;
    } else {
      firstNameField.setCustomValidity("");
    }

    // Validate Last Name
    const lastNameField = document.getElementById("lastName");
    const lastName = lastNameField.value;
    if (!nameRegex.test(lastName)) {
      lastNameField.setCustomValidity("Please use letters only.");
      valid = false;
    } else {
      lastNameField.setCustomValidity("");
    }

    // Validate Phone: Check if exactly 10 digits are entered
    const phoneField = document.getElementById("phone");
    const phoneDigits = phoneField.value.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      phoneField.setCustomValidity("Please enter a valid 10-digit phone number.");
      valid = false;
    } else {
      phoneField.setCustomValidity("");
    }

    if (valid && form.checkValidity()) {
      const formData = {
        firstName: firstName,
        lastName: lastName,
        email: document.getElementById("email").value,
        phone: phoneField.value,
        issue: document.getElementById("issue").value,
        comments: document.getElementById("comments").value,
      };

      // Show the loading overlay
      showLoadingOverlay();

      fetch(endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          hideLoadingOverlay();
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not ok");
        })
        .then((data) => {
          // If your server returns { status: "Succeeded" } on success:
          if (data.status && data.status === "Succeeded") {
            // Show the Bootstrap modal instead of an alert
            const successModalEl = document.getElementById("successModal");
            const successModal = new bootstrap.Modal(successModalEl);
            successModal.show();

            // Reset the form
            form.reset();
            form.classList.remove("was-validated");
          } else {
            console.error("Error in response data:", data);
            alert("There was an error with your submission. Please try again.");
          }
        })
        .catch((error) => {
          hideLoadingOverlay();
          console.error("Error:", error);
          alert("There was an error with your submission. Please try again.");
        });
    }

    form.classList.add("was-validated");
  });
});
