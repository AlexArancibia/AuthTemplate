"use client";

import { useEffect } from "react";
import { useMainStore } from "@/stores/mainStore";
import { useCurrencyStore } from "@/stores/currency";

export function StoreInitializer() {
	const { initializeStore } = useMainStore();
	const { fetchCurrencies } = useCurrencyStore();

	useEffect(() => {
		const initializeStores = async () => {
			try {
				console.log("🔄 [StoreInitializer] Inicializando stores...");

				// Inicializar el main store
				await initializeStore();

				// Inicializar el currency store
				await fetchCurrencies();

				console.log("✅ [StoreInitializer] Stores inicializados correctamente");
			} catch (error) {
				console.error(
					"❌ [StoreInitializer] Error inicializando stores:",
					error,
				);
			}
		};

		initializeStores();
	}, [initializeStore, fetchCurrencies]);

	// Este componente no renderiza nada, solo inicializa los stores
	return null;
}
