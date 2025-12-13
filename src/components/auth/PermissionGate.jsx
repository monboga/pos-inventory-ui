import { usePermission } from '../../hooks/usePermission';

function PermissionGate({ permission, children, renderOtherwise = null }) {
    const hasPermission = usePermission(permission);

    if (hasPermission) {
        return <>{children}</>;
    }

    // Si no tiene permiso, renderiza null o lo que pases en renderOtherwise (ej: un mensaje de bloqueo)
    return renderOtherwise;
}

export default PermissionGate;