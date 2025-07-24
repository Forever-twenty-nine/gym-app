import { Rol } from '../enums/rol.enum';

export const ROL_OPTIONS: { label: string; value: Rol }[] = [
    { label: 'Cliente', value: Rol.CLIENTE },
    { label: 'Entrenador', value: Rol.ENTRENADOR },
    { label: 'Gimnasio', value: Rol.GIMNASIO },
    { label: 'Personal Trainer', value: Rol.PERSONAL_TRAINER },
];
