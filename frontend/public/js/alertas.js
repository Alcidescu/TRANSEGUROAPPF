// Configuración de tipos de alerta y prioridades
const ALERT_TYPES = {
  maintenance: { name: 'Mantenimiento', icon: 'fa-tools' },
  documentation: { name: 'Documentación', icon: 'fa-file-alt' },
  insurance: { name: 'Seguro', icon: 'fa-file-contract' },
  mileage: { name: 'Kilometraje', icon: 'fa-tachometer-alt' }
};

const PRIORITY_LEVELS = {
  high: { name: 'Alta', class: 'high', icon: 'fa-exclamation-circle' },
  medium: { name: 'Media', class: 'medium', icon: 'fa-exclamation-triangle' },
  low: { name: 'Baja', class: 'low', icon: 'fa-info-circle' }
};

// Estado inicial
let alertas = [
  {
    id: 1,
    tipo: 'maintenance',
    vehiculo: 'ABC-123',
    prioridad: 'high',
    descripcion: 'Mantenimiento preventivo programado',
    fecha: '2025-05-15',
    estado: 'pending',
    fechaCreacion: new Date()
  },
  {
    id: 2,
    tipo: 'insurance',
    vehiculo: 'XYZ-789',
    prioridad: 'medium',
    descripcion: 'Renovación de seguro pendiente',
    fecha: '2025-06-30',
    estado: 'pending',
    fechaCreacion: new Date()
  }
];

// Funciones principales
function renderAlertas() {
  const container = document.getElementById('alertsContainer');
  const template = document.getElementById('alertTemplate');
  container.innerHTML = '';

  const filteredAlerts = filterAlerts();
  updateStats(filteredAlerts);

  filteredAlerts.forEach(alerta => {
    const clone = template.content.cloneNode(true);
    const alertEl = clone.querySelector('.alerta-card');
    
    // Configurar prioridad y estado
    alertEl.classList.add(`prioridad-${alerta.prioridad}`, alerta.estado);
    
    // Llenar datos
    const tipo = ALERT_TYPES[alerta.tipo];
    const prioridad = PRIORITY_LEVELS[alerta.prioridad];
    
    // Header
    const header = alertEl.querySelector('.alerta-header');
    header.querySelector('i').className = `fas ${tipo.icon}`;
    header.querySelector('h4').textContent = tipo.name;
    const badge = header.querySelector('.badge');
    badge.textContent = prioridad.name;
    badge.classList.add(prioridad.class);
    
    // Contenido
    alertEl.querySelector('.vehicle-info span').textContent = alerta.vehiculo;
    alertEl.querySelector('.description').textContent = alerta.descripcion;
    alertEl.querySelector('.due-date span').textContent = alerta.fecha ? formatDate(alerta.fecha) : 'N/A';
    alertEl.querySelector('.created-date span').textContent = formatDate(alerta.fechaCreacion);
    
    // Event listeners
    alertEl.querySelector('.resolve').addEventListener('click', () => resolveAlert(alerta.id));
    alertEl.querySelector('.delete').addEventListener('click', () => deleteAlert(alerta.id));
    
    container.appendChild(clone);
  });
}

function filterAlerts() {
  const search = document.getElementById('searchAlert').value.toLowerCase();
  const type = document.getElementById('typeFilter').value;
  const status = document.getElementById('statusFilter').value;

  return alertas.filter(a => {
    return (type === 'all' || a.tipo === type) &&
           (status === 'all' || a.estado === status) &&
           a.vehiculo.toLowerCase().includes(search);
  });
}

function updateStats(alerts) {
  document.getElementById('criticalCount').textContent = 
    alerts.filter(a => a.prioridad === 'high' && a.estado === 'pending').length;
    
  document.getElementById('pendingCount').textContent = 
    alerts.filter(a => a.estado === 'pending').length;
}

// Funciones de gestión de alertas
function createAlert(data) {
  const newAlert = {
    id: Date.now(),
    ...data,
    estado: 'pending',
    fechaCreacion: new Date()
  };
  
  alertas.unshift(newAlert);
  renderAlertas();
  closeModal();
}

function resolveAlert(id) {
  if (confirm('¿Estás seguro de marcar esta alerta como resuelta?')) {
    const index = alertas.findIndex(a => a.id === id);
    if (index !== -1) {
      alertas[index].estado = 'resolved';
      renderAlertas();
    }
  }
}

function deleteAlert(id) {
  if (confirm('¿Estás seguro de eliminar esta alerta?')) {
    alertas = alertas.filter(a => a.id !== id);
    renderAlertas();
  }
}

// Funciones auxiliares
function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Gestión del modal
function openModal() {
  document.getElementById('alertModal').classList.add('active');
}

function closeModal() {
  document.getElementById('alertModal').classList.remove('active');
  document.getElementById('alertForm').reset();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Renderizar alertas iniciales
  renderAlertas();
  
  // Configurar filtros
  document.getElementById('searchAlert').addEventListener('input', renderAlertas);
  document.getElementById('typeFilter').addEventListener('change', renderAlertas);
  document.getElementById('statusFilter').addEventListener('change', renderAlertas);
  
  // Configurar modal
  document.getElementById('newAlertBtn').addEventListener('click', openModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  
  // Configurar formulario
  document.getElementById('alertForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      tipo: document.getElementById('alertType').value,
      vehiculo: document.getElementById('alertVehicle').value,
      prioridad: document.getElementById('alertPriority').value,
      descripcion: document.getElementById('alertDescription').value,
      fecha: document.getElementById('alertDueDate').value || null
    };
    
    createAlert(formData);
  });
  
  // Cargar vehículos en el formulario (simulado)
  const vehicleSelect = document.getElementById('alertVehicle');
  ['ABC-123', 'XYZ-789', 'DEF-456'].forEach(placa => {
    const option = document.createElement('option');
    option.value = placa;
    option.textContent = placa;
    vehicleSelect.appendChild(option);
  });
});
