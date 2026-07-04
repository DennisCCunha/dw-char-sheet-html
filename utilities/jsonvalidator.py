import json
from pathlib import Path


def corrigir_json(texto):
    resultado = []
    dentro_string = False
    escape = False

    for c in texto:
        if escape:
            resultado.append(c)
            escape = False
            continue

        if c == "\\":
            resultado.append(c)
            escape = True
            continue

        if c == '"':
            dentro_string = not dentro_string
            resultado.append(c)
            continue

        if dentro_string:
            if c == "\n":
                resultado.append("\\n")
            elif c == "\r":
                continue
            else:
                resultado.append(c)
        else:
            resultado.append(c)

    return "".join(resultado)


def processar_arquivo(arquivo: Path):
    try:
        texto = arquivo.read_text(encoding="utf-8")
        texto_corrigido = corrigir_json(texto)

        obj = json.loads(texto_corrigido)

        arquivo.write_text(
            json.dumps(obj, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        print(f"✓ Corrigido: {arquivo}")

    except json.JSONDecodeError as e:
        print(f"✗ JSON inválido ({arquivo}): {e}")

    except Exception as e:
        print(f"✗ Erro em {arquivo}: {e}")


def main():
    # Pasta onde está o script
    pasta_script = Path(__file__).resolve().parent

    # Um nível acima
    pasta_raiz = pasta_script.parent

    print(f"Procurando arquivos JSON em: {pasta_raiz}\n")

    arquivos = list(pasta_raiz.rglob("*.json"))

    if not arquivos:
        print("Nenhum arquivo JSON encontrado.")
        return

    for arquivo in arquivos:
        processar_arquivo(arquivo)

    print(f"\nProcessados {len(arquivos)} arquivo(s).")


if __name__ == "__main__":
    main()