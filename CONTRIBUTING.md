# Contribuyendo a DTE

¡Gracias por tu interés en contribuir a DTE! 

## Proceso de Contribución

1. Fork el repositorio
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios
4. Asegúrate de que el código pase el linting
5. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
6. Push a la rama (`git push origin feature/AmazingFeature`)
7. Abre un Pull Request

## Estándares de Código

- Utiliza TypeScript para todo el código nuevo
- Sigue las configuraciones de ESLint existentes
- Mantén los componentes pequeños y reutilizables
- Documenta las funciones y componentes complejos
- Utiliza nombres descriptivos para variables y funciones

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes React
  ├── types/         # Tipos TypeScript
  ├── hooks/         # Custom hooks
  ├── utils/         # Funciones utilitarias
  ├── App.tsx        # Componente principal
  └── main.tsx       # Punto de entrada
```

## Commits

- Usa mensajes de commit claros y descriptivos
- Sigue el formato: `tipo(alcance): descripción`
- Tipos comunes: feat, fix, docs, style, refactor, test, chore

## Pull Requests

- Describe claramente los cambios realizados
- Menciona cualquier issue relacionado
- Incluye capturas de pantalla si es relevante
- Asegúrate de que pase todas las pruebas

## Preguntas

Si tienes alguna pregunta, no dudes en abrir un issue o contactar a los mantenedores.