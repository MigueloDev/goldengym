import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, User } from 'lucide-react';
import { Icon } from '@/components/icon';

interface Client {
    id: number;
    name: string;
    email: string;
    identification_number: string;
}

interface ClientSearchProps {
    value: string;
    onValueChange: (value: string) => void;
    onClientSelect: (client: Client) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    selectedClient?: Client | null;
}

export default function ClientSearch({
    value,
    onValueChange,
    onClientSelect,
    placeholder = "Buscar cliente por nombre, email o cédula...",
    label = "Cliente",
    error,
    selectedClient: externalSelectedClient
}: ClientSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Sincronizar con el cliente externo seleccionado
    useEffect(() => {
        if (externalSelectedClient) {
            setSelectedClient(externalSelectedClient);
            setSearchQuery(`${externalSelectedClient.name} - ${externalSelectedClient.email}`);
        }
    }, [externalSelectedClient]);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Buscar clientes cuando cambia la consulta
    useEffect(() => {
        if (selectedClient) {
          return;
        }

        const searchClients = async () => {
            if (searchQuery.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/clients/search?query=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Error buscando clientes:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchClients, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedClient]);

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client);
        setSearchQuery(`${client.name} - ${client.email}`);
        onClientSelect(client);
        onValueChange(client.id.toString());
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedClient(null);
        setSearchQuery('');
        onValueChange('');
        setResults([]);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchQuery(newValue);

        // Si se borra el input, limpiar la selección
        if (!newValue) {
            setSelectedClient(null);
            onValueChange('');
        }
    };

    return (
        <div className="space-y-2" ref={searchRef}>
            {label && <Label>{label}</Label>}

            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={`pl-10 pr-10 ${error ? 'border-red-500' : ''}`}
                        onFocus={() => {
                            if (searchQuery.length >= 2) {
                                setIsOpen(true);
                            }
                        }}
                    />
                    {selectedClient && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Dropdown de resultados */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Buscando...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="py-1">
                                {results.map((client) => (
                                    <button
                                        key={client.id}
                                        type="button"
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {client.name}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate">
                                                    {client.email}
                                                </div>
                                                {client.identification_number && (
                                                    <div className="text-xs text-gray-400">
                                                        {client.identification_number}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : searchQuery.length >= 2 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No se encontraron clientes
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
