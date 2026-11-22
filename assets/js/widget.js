(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const areaInput = document.getElementById("area-input");
    const areaRange = document.getElementById("area-range");
    const packageSelect = document.getElementById("package-select");
    const totalPrice = document.getElementById("total-price");
    const errorArea = document.getElementById("error-area");
    const objectRadios = document.querySelectorAll('input[name="object-type"]');

    if (!(areaInput instanceof HTMLInputElement)
      || !(areaRange instanceof HTMLInputElement)
      || !(packageSelect instanceof HTMLSelectElement)
      || !(totalPrice instanceof HTMLElement)
      || !(errorArea instanceof HTMLElement)) {
      return;
    }

    const formatPrice = (value) => {
      if (!Number.isFinite(value) || value < 0) {
        return "0 грн";
      }

      const roundedValue = Math.round(value);
      return `${String(roundedValue).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} грн`;
    };

    const showAreaError = (message) => {
      errorArea.textContent = message;
      errorArea.classList.remove("hidden");
      areaInput.setAttribute("aria-invalid", "true");
      areaInput.classList.remove("border-[#22252A]/20");
      areaInput.classList.add("border-red-500");
      totalPrice.textContent = "0 грн";
    };

    const clearAreaError = () => {
      errorArea.textContent = "";
      errorArea.classList.add("hidden");
      areaInput.setAttribute("aria-invalid", "false");
      areaInput.classList.remove("border-red-500");
      areaInput.classList.add("border-[#22252A]/20");
    };

    const updateEstimate = () => {
      const rawArea = areaInput.value.trim();

      if (rawArea === "") {
        showAreaError("Введіть площу приміщення.");
        return;
      }

      const area = Number(rawArea);
      if (!Number.isFinite(area)) {
        showAreaError("Введіть коректне числове значення площі.");
        return;
      }

      if (area < 0) {
        showAreaError("Площа не може бути від’ємною.");
        return;
      }

      if (area < 10 || area > 1000) {
        showAreaError("Площа має бути в межах від 10 до 1 000 м².");
        return;
      }

      const packageRate = Number(packageSelect.value);
      if (!Number.isFinite(packageRate) || packageRate < 0) {
        showAreaError("Оберіть коректний пакет послуг.");
        return;
      }

      const selectedObject = Array.from(objectRadios).find(
        (radio) => radio instanceof HTMLInputElement && radio.checked
      );
      const objectMultiplier = selectedObject instanceof HTMLInputElement
        ? Number(selectedObject.value)
        : 1;

      if (!Number.isFinite(objectMultiplier) || objectMultiplier < 0) {
        showAreaError("Оберіть коректний тип об’єкта.");
        return;
      }

      const total = Math.round(area * packageRate * objectMultiplier);
      if (!Number.isFinite(total) || total < 0) {
        showAreaError("Не вдалося розрахувати коректну вартість.");
        return;
      }

      clearAreaError();
      totalPrice.textContent = formatPrice(total);
    };

    areaInput.addEventListener("input", () => {
      const rawArea = areaInput.value.trim();
      const area = Number(rawArea);

      if (rawArea !== "" && Number.isFinite(area) && area >= 10 && area <= 1000) {
        areaRange.value = String(area);
      }

      updateEstimate();
    });

    areaInput.addEventListener("change", updateEstimate);

    areaRange.addEventListener("input", () => {
      const area = Number(areaRange.value);
      if (Number.isFinite(area) && area >= 10 && area <= 1000) {
        areaInput.value = String(area);
        updateEstimate();
      }
    });

    areaRange.addEventListener("change", updateEstimate);
    packageSelect.addEventListener("change", updateEstimate);
    packageSelect.addEventListener("input", updateEstimate);

    objectRadios.forEach((radio) => {
      if (radio instanceof HTMLInputElement) {
        radio.addEventListener("change", updateEstimate);
        radio.addEventListener("input", updateEstimate);
      }
    });

    document.querySelectorAll("[data-package-link]").forEach((link) => {
      link.addEventListener("click", () => {
        if (!(link instanceof HTMLElement)) {
          return;
        }

        const packageValues = {
          sketch: "600",
          full: "1200",
          premium: "2000"
        };
        const packageValue = packageValues[link.dataset.packageLink];

        if (packageValue) {
          packageSelect.value = packageValue;
          updateEstimate();
        }
      });
    });

    updateEstimate();
  });
})();