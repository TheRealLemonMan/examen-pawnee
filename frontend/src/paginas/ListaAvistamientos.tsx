import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarAvistamientos, listarCriaturas } from "../api/pawneeApi";
import { Criatura, Avistamiento, nombreCriatura } from "../tipos";
import { EstadoCarga } from "../components/EstadoCarga";
export function ListaAvistamientos() {
  const [datos, setDatos] = useState<Avistamiento[]>([]),
    [criaturas, setCriaturas] = useState<Criatura[]>([]);
  const [criaturaId, setCriaturaId] = useState(""),
    [recarga, setRecarga] = useState(0),
    [cargando, setCargando] = useState(true),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let vigente = true;
    listarCriaturas()
      .then((x) => {
        if (vigente) setCriaturas(x);
      })
      .catch(() => {
        if (vigente) setError("No se pudo cargar el selector");
      });
    return () => {
      vigente = false;
    };
  }, []);
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    listarAvistamientos(criaturaId)
      .then((x) => {
        if (vigente) setDatos(x);
      })
      .catch((e: unknown) => {
        if (vigente)
          setError(e instanceof Error ? e.message : "Error de carga");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [criaturaId, recarga]);
  return (
    <section>
      <h1>Avistamientos</h1>
      <p>
        <Link to="/avistamientos/nuevo">Registrar avistamiento</Link>
      </p>
      <label htmlFor="criatura-filtro">Criatura </label>
      <select
        id="criatura-filtro"
        value={criaturaId}
        onChange={(e) => setCriaturaId(e.target.value)}
      >
        <option value="">Todas</option>
        {criaturas.map((c) => (
          <option key={c._id} value={c._id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <button onClick={() => setRecarga((x) => x + 1)}>Actualizar lista</button>
      <EstadoCarga cargando={cargando} error={error} vacio={!datos.length} />
      {!cargando && !error && datos.length > 0 && (
        <ul>
          {datos.map((a) => (
            <li key={a._id}>
              <Link to={`/avistamientos/${a._id}`}>{a.testigo}</Link> ·{" "}
              {nombreCriatura(a.criatura)} · {a.ubicacion}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
