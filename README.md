# Kimenko - Sistema de Análisis de Caudal y Datos

Sistema profesional de análisis de caudal y gestión de datos energéticos desarrollado por Kimenko.

## 🚀 Características

- **Análisis de Caudal**: Herramientas avanzadas para análisis de flujo de agua y detección de pérdidas
- **Análisis Xylem**: Procesamiento de archivos Excel con datos de consumo energético
- **Gráficos Interactivos**: Visualización de datos con ECharts y análisis estadísticos
- **Interfaz Profesional**: Diseño moderno con soporte para modo oscuro
- **Responsive Design**: Compatible con dispositivos móviles y desktop

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Gráficos**: ECharts para React
- **Procesamiento**: XLSX para archivos Excel
- **Iconos**: Lucide React

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd frontend-kimenko
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Crea un archivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## 🔧 Configuración de la API

Por defecto, la aplicación se conecta a `http://localhost:8000`. Para cambiar esta configuración:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega la variable: `NEXT_PUBLIC_API_URL=tu-url-de-api`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas principales
│   ├── page.tsx           # Análisis de Caudal
│   ├── xylem/             # Análisis Xylem
│   └── layout.tsx         # Layout global
├── components/            # Componentes reutilizables
│   ├── sideBar.tsx       # Navegación lateral
│   └── analysis/         # Componentes de análisis
└── helpers/              # Funciones de utilidad
    ├── fetchAnalysis.ts  # API de análisis
    └── fetchPlaces.ts    # API de lugares
```

## 🎯 Funcionalidades

### Análisis de Caudal
- Selección de lugar y parámetros temporales
- Visualización de datos de flujo vs pérdidas
- Filtros avanzados y zoom interactivo

### Análisis Xylem
- Carga de archivos Excel con datos de consumo
- Procesamiento automático de datos acumulativos
- Análisis estadístico con tendencias y anomalías
- Múltiples vistas: horaria, diaria, semanal

## 🚀 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Servidor de producción
npm run lint     # Linter de código
```

## 🔧 Desarrollo

Para contribuir al proyecto:

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios siguiendo las convenciones del proyecto
3. Ejecuta las pruebas: `npm run lint`
4. Haz commit de tus cambios: `git commit -m "feat: descripción"`
5. Haz push de la rama: `git push origin feature/nueva-funcionalidad`
6. Crea un Pull Request

## 📄 Licencia

© 2024 Kimenko. Todos los derechos reservados.

## 📞 Contacto

Para soporte técnico o consultas, visita [kimenko.cl](https://kimenko.cl)
