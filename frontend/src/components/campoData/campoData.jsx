import { useEffect, useId, useRef, useState } from "react";
import {
  dataBRParaISO,
  formatarDataDigitada,
  isoParaDataBR,
} from "../../utils/formatos";
import "./campoData.scss";

function mensagemDeValidacao(valor, minDate, maxDate) {
  if (!valor) return "";

  const data = dataBRParaISO(valor);
  if (!data) return "Digite uma data válida no formato DD/MM/AAAA.";
  if (minDate && data < minDate) return "Escolha uma data dentro do período permitido.";
  if (maxDate && data > maxDate) return "Escolha uma data dentro do período permitido.";
  return "";
}

export default function CampoData({
  id,
  name,
  value,
  onChange,
  required = false,
  minDate,
  maxDate,
  disabled = false,
  autoComplete,
  "aria-describedby": ariaDescribedBy,
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const ultimoValorEmitido = useRef(value || "");
  const [visual, setVisual] = useState(() => isoParaDataBR(value));

  useEffect(() => {
    if (value !== ultimoValorEmitido.current) {
      setVisual(isoParaDataBR(value));
      ultimoValorEmitido.current = value || "";
    }
  }, [value]);

  function atualizar(event) {
    const proximo = formatarDataDigitada(event.target.value);
    const iso = dataBRParaISO(proximo);
    const erro = mensagemDeValidacao(proximo, minDate, maxDate);

    event.target.setCustomValidity(erro);
    setVisual(proximo);
    ultimoValorEmitido.current = iso;
    onChange?.(iso);
  }

  function validar(event) {
    const erro = mensagemDeValidacao(visual, minDate, maxDate)
      || (required && !visual ? "Preencha este campo." : "");
    event.currentTarget.setCustomValidity(erro);
  }

  return (
    <span className="campo-data">
      <input
        id={inputId}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder="DD/MM/AAAA"
        maxLength={10}
        required={required}
        disabled={disabled}
        value={visual}
        onChange={atualizar}
        onBlur={validar}
        onInvalid={validar}
        aria-describedby={ariaDescribedBy}
      />
      <i className="fa-regular fa-calendar" aria-hidden="true" />
    </span>
  );
}
